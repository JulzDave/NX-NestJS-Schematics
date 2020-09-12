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
import { IDependency } from './dependency';
// You don't have to export the function as default. You can also have more than one rule factory
// per file.

const PACKAGE_LOCK_PATH = 'package-lock.json';
const WORKSPACE_PATH = 'workspace.json';
const NOT_IN_NX_WORKSPACE_MSG = 'Not an NX CLI workspace';
const SCHEMATICS_TEMPLATES_PATH = 'files';
const { Default: dependencies, Dev: devDependencies } = NodeDependencyType;
const DEPENDENCIES: IDependency[] = [
    { name: 'elastic-apm-node', version: '^3.6.1', type: dependencies },
    { name: '@nestjs/swagger', version: '^4.5.7', type: dependencies },
    { name: 'swagger-ui-express', version: '^4.1.4', type: dependencies },
    { name: 'compression', version: '^1.7.4', type: dependencies },
    { name: 'helmet', version: '^3.22.0', type: dependencies },
    { name: '@types/helmet', version: '0.0.48', type: devDependencies },
    { name: 'csurf', version: '^1.11.0', type: dependencies },
];

export function nest(options: ISchema): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const workspaceConfigBuffer = tree.read(WORKSPACE_PATH);
        if (!workspaceConfigBuffer) {
            throw new SchematicsException(NOT_IN_NX_WORKSPACE_MSG);
        }
        const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());

        const pluginName = options.pluginName;
        const pluginSrcFolderPath =
            workspaceConfig?.projects?.[dasherize(pluginName)]?.sourceRoot;
        if (!pluginSrcFolderPath) {
            throw new SchematicsException(`Plugin ${pluginName} not found`);
        }

        const defaultProjectPath = buildDefaultPath(pluginSrcFolderPath);
        const parsedPath = parseName(defaultProjectPath, pluginName);
        const { name } = parsedPath;
        const sourceTemplates = url(SCHEMATICS_TEMPLATES_PATH);
        const sourceParameterizedTemplates = apply(sourceTemplates, [
            template({
                ...options,
                ...strings,
                name,
            }),
            move(pluginSrcFolderPath),
        ]);
        deletePackageLock();
        DEPENDENCIES.forEach((dependency) => {
            const dependencyDetails: NodeDependency = _nodeDependencyFactory(
                dependency.name,
                dependency.version,
                dependency.type,
            );
            addPackageJsonDependency(tree, dependencyDetails);
        });
        context.addTask(new NodePackageInstallTask());
        context.engine.executePostTasks().subscribe(() => {
            displayMsgToStdOut(DEPENDENCIES);
        })
        // context.addTask(new RunSchematicTask('add-dependencies', options), [installTaskId]);
        return mergeWith(sourceParameterizedTemplates)(tree, context);
    };

    function _nodeDependencyFactory(
        packageName: string,
        version: string,
        nodeDependencyType: NodeDependencyType,
    ): NodeDependency {
        return {
            type: nodeDependencyType,
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
