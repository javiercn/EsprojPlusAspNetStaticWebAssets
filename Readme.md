# Remove any package-lock.json in the app

The esproj projects won't restore because they see a package-lock.json and believe the project is up to date.

## Suggested fix
The output from npm really is a package-lock.json file inside node_modules, so the output item should be based on that (which can be inside a node_modules folder in any level at the project.json or above in the file system hierarchy)

package.json and package-lock.json are both inputs to the process. package.json can change when the user updates it, and package-lock.json might change as a result of npm install or as part of tooling (like npm audit fix) updating it.

## SDK

Download a recent version of the dotnet SDK (like 7.0) as a zip, extract it, and set it on the path with the following variables:
Set dotnet on the path
  $env:DOTNET_ROOT = $dotNetFolder;
  $env:DOTNET_MULTILEVEL_LOOKUP = 0;
  $env:Path = "$dotNetFolder;$env:Path";

## Solution restore

This requires changes on the local SDK. Adding this target inside 
`sdk\7.0.203\Current\SolutionFile\ImportAfter\Microsoft.NET.Sdk.Solution.targets` should do the trick

```xml
<Target Name="NpmRestore" AfterTargets="Restore">
  <ItemGroup>
    <PackageJson Include="$(SolutionDir)**\package.json" />
    <_ProjectRef Include="@(ProjectReference->'%(Extension)')" />
    <EsProjReference Include="@(ProjectReference)" Condition="'%(ProjectReference.Extension)' == '.esproj'" />
  </ItemGroup>
  <MSBuild Condition="@(EsProjReference) != ''"
    BuildInParallel="$(RestoreBuildInParallel)"
    Projects="@(EsProjReference)"
    Targets="RunNpmInstall"
    SkipNonexistentTargets="true">
  </MSBuild>
</Target>
```

With that, you can run dotnet restore at the solution level

## Dotnet restore on the project

It requires to hook on to nuget restore from the esproj
```xml
  <Target Name="RestoreNpm" DependsOnTargets="RunNpmInstall" BeforeTargets="Restore" />
```

## Dotnet restore from a referenced project

This needs some code on the csproj file, we can figure out if there is a better way we can integrate with nuget to support this. (This is so that when you run restore on a project, the esproj also gets restored (same as the other dependencies))

```xml
	<Target Name="RestoreReferencedNpmProjects" BeforeTargets="Restore">
		<ItemGroup>
			<EsProjReference Include="@(ProjectReference)" Condition="'%(ProjectReference.Extension)' == '.esproj'" />
		</ItemGroup>
		<MSBuild Condition="@(EsProjReference) != ''" BuildInParallel="$(RestoreBuildInParallel)" Projects="@(EsProjReference)" Targets="RunNpmInstall" SkipNonexistentTargets="true">
		</MSBuild>

	</Target>
```

