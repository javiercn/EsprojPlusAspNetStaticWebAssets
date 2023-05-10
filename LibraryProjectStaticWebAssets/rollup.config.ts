import path from 'path';
import typescript, { RollupTypescriptOptions } from '@rollup/plugin-typescript'
import nodeResolve from "@rollup/plugin-node-resolve"
import { RollupOptions } from 'rollup';
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import filesize from 'rollup-plugin-filesize'
import license from 'rollup-plugin-license'

interface Args {
    'config-intermediate-output-dir': string,
}

export default (args: Args): RollupOptions => {

    const baseDir = args['config-intermediate-output-dir'] || path.join(__dirname, 'dist');

    const typeScriptOptions: RollupTypescriptOptions = {
        tsconfig: './tsconfig.json',
        sourceMap: true
    }

    const result: RollupOptions = {
        input: 'app.ts',
        output: {
            file: path.join(baseDir, 'app.mjs'),
            sourcemap: true,
            format: 'es'
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            typescript(typeScriptOptions),
            license({
                banner: {
                    commentStyle: 'ignored',
                    content: 'For license information please see AuthenticationService.mjs.LICENSE.txt'
                },
                thirdParty: {
                    output: path.join(baseDir, 'AuthenticationService.mjs.LICENSE.txt'),
                }
            }),
            terser({
                ecma: 2020,
                compress: {
                    passes: 3,
                },
                module: true,
                format: {
                    ecma: 2020,
                    comments: /.*For license information please see AuthenticationService.mjs.LICENSE.txt.*/
                },
                keep_classnames: false,
                keep_fnames: false,
                toplevel: true,
            }),
            filesize()
        ],
        treeshake: {
            preset: 'smallest'
        }
    }

    return result;
}