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
import { dasherize } from '@angular-devkit/core/src/utils/strings';
import { strings } from '@angular-devkit/core';
import { ISchema } from './schema';
import { parseName } from '@schematics/angular/utility/parse-name';
import { buildDefaultPath } from '@schematics/angular/utility/project';
import { displayMsgToStdOut } from './services/display-message';
import {
    NodeDependency,
    addPackageJsonDependency,
    NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import { unlinkSync, existsSync } from 'fs';
console.log(parseName, buildDefaultPath);
// You don't have to export the function as default. You can also have more than one rule factory
// per file.

const PACKAGE_LOCK_PATH = 'package-lock.json';
const WORKSPACE_PATH = 'workspace.json';
const NOT_IN_NX_WORKSPACE_MSG = 'Not an NX CLI workspace';
const SCHEMATICS_TEMPLATES_PATH = 'files';
const DEPENDENCIES: [string, string][] = [
    ['elastic-apm-node', '^3.6.1'],
    ['@nestjs/swagger', '^4.5.7'],
    ['swagger-ui-express', '^4.1.4'],
    ['compression', '^1.7.4'],
    ['helmet', '^3.22.0'],
    ['@types/helmet', '0.0.48'],
    ['csurf', '^1.11.0'],
];

export function nest(options: ISchema): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const workspaceConfigBuffer = tree.read(WORKSPACE_PATH);
        if (!workspaceConfigBuffer) {
            throw new SchematicsException(NOT_IN_NX_WORKSPACE_MSG);
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
        const sourceTemplates = url(SCHEMATICS_TEMPLATES_PATH);
        const sourceParameterizedTemplates = apply(sourceTemplates, [
            template({
                ...options,
                ...strings,
                name,
            }),
            move(foundPlugin),
        ]);
        deletePackageLock();
        context.addTask(new NodePackageInstallTask());
        // context.addTask(new RunSchematicTask('add-dependencies', options), [installTaskId]);
        for (const dependency of DEPENDENCIES) {
            const dependencyDetails: NodeDependency = _nodeDependencyFactory(
                dependency[0],
                dependency[1],
            );
            addPackageJsonDependency(tree, dependencyDetails);
        }
        setTimeout(() => {
            displayMsgToStdOut();
        }, 0);
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
function deletePackageLock() {
    if (existsSync(PACKAGE_LOCK_PATH)) {
        unlinkSync(PACKAGE_LOCK_PATH);
    }
}

