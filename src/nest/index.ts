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
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
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
import {
    NodeDependency,
    addPackageJsonDependency,
    NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
console.log(parseName, buildDefaultPath);
// You don't have to export the function as default. You can also have more than one rule factory
// per file.

export function nest(options: ISchema): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const workspaceConfigBuffer = tree.read('workspace.json');
        if (!workspaceConfigBuffer) {
            throw new SchematicsException('Not an NX CLI workspace');
        }
        const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());

        const pluginName = options.pluginName;
        const foundPlugin =
            workspaceConfig?.projects?.[dasherize(pluginName)]?.sourceRoot;
        if (!foundPlugin) {
            throw new SchematicsException(`Plugin ${pluginName} not found`);
        }
        const defaultProjectPath = buildDefaultPath(foundPlugin);
        const parsedPath = parseName(defaultProjectPath, pluginName);
        const { name } = parsedPath;
        const sourceTemplates = url('./files');
        const sourceParameterizedTemplates = apply(sourceTemplates, [
            template({
                ...options,
                ...strings,
                name,
            }),
            move(foundPlugin),
        ]);
        context.addTask(new NodePackageInstallTask());
        // context.addTask(new RunSchematicTask('add-dependencies', options), [installTaskId]);
        const lodashDependency: NodeDependency = _nodeDependencyFactory(
            'tiny',
            '^0.0.10',
        );
        addPackageJsonDependency(tree, lodashDependency);
        return mergeWith(sourceParameterizedTemplates)(tree, context);
    };
    function _nodeDependencyFactory(
        packageName: string,
        version: string,
    ): NodeDependency {
        return {
            type: NodeDependencyType.Default,
            name: packageName,
            version: version,
            overwrite: true,
        };
    }
}
