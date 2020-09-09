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
import { yellow, underline, bold } from 'chalk';
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

const DEPENDENCIES: [string, string][] = [
    ['elastic-apm-node', '^3.6.1'],
    ['@nestjs/swagger', '^4.5.7'],
    ['swagger-ui-express', '^4.1.4'],
    ['compression', '^1.7.4'],
];

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
        for (const dependency of DEPENDENCIES) {
            const lodashDependency: NodeDependency = _nodeDependencyFactory(
                dependency[0],
                dependency[1],
            );
            addPackageJsonDependency(tree, lodashDependency);
        }
        console.log(yellow('                __          _____ '));
        console.log(yellow('  _____ _____ _/  |______ _/ ____\\'));
        console.log(yellow(' /     \\\\__  \\\\   __\\__  \\\\   __\\ '));
        console.log(yellow('|  Y Y  \\/ __ \\|  |  / __ \\|  |   '));
        console.log(yellow('|__|_|  (____  /__| (____  /__|   '));
        console.log(yellow('      \\/     \\/          \\/       \n\n'));
        console.log(yellow(bold(underline('This is an NX-NestJS dedicated plugin schematic\n'))))
        console.log(yellow('* Address placeholders and provide useful content'))
        console.log(yellow('* Confirm APM ports are open and ready.'))
        console.log(yellow('* Subsequently, uncomment the APM configurations in the main.ts file.\n\n'))




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
