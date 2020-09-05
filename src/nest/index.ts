import {
    Rule,
    SchematicContext,
    Tree,
    apply,
    mergeWith,
    template,
    url,
    SchematicsException,
    move,
} from '@angular-devkit/schematics';
import {
    dasherize,
    // classify,
    // camelize,
    // underscore,
} from '@angular-devkit/core/src/utils/strings';
import { strings } from '@angular-devkit/core';
import { ISchema } from './schema';
import { parseName } from '@schematics/angular/utility/parse-name';
import { buildDefaultPath } from '@schematics/angular/utility/project';
import { writeFileSync } from 'fs'
// import { IWorkspace } from '../interfaces/workspace';

console.log(parseName, buildDefaultPath);
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function nest(_options: ISchema): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const workspaceConfigBuffer = tree.read('workspace.json');
        const packageJsonConfigBuffer = tree.read('package.json');
        if (!workspaceConfigBuffer) {
            throw new SchematicsException('Not an NX CLI workspace');
        }
        if (!packageJsonConfigBuffer) {
            throw new SchematicsException('Not a NodeJS workspace');
        }
        const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());
        const packageJsonConfig = JSON.parse(packageJsonConfigBuffer.toString());
        packageJsonConfig.scripts["julian"] = true
        writeFileSync('./package.json', JSON.stringify(packageJsonConfig, null, 4))

        const pluginName = _options.pluginName;
        const foundPlugin = workspaceConfig?.projects?.[dasherize(pluginName)]?.sourceRoot;
        if (!foundPlugin) {
            throw new SchematicsException(`Plugin ${pluginName} not found`);
        }
        const defaultProjectPath = buildDefaultPath(foundPlugin);
        const parsedPath = parseName(defaultProjectPath, pluginName);
        const { name } = parsedPath;
        const sourceTemplates = url('./files');
        const sourceParameterizedTemplates = apply(sourceTemplates, [
            template({
                ..._options,
                ...strings,
                name,
            }),
            move(foundPlugin),
        ]);
        return mergeWith(sourceParameterizedTemplates)(tree, _context);
    };
}
