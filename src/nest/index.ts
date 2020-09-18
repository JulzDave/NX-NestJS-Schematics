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
import { parseName } from '@schematics/angular/utility/parse-name';
import { buildDefaultPath } from '@schematics/angular/utility/project';
import {
    NodeDependency,
    addPackageJsonDependency,
    NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import { existsSync } from 'fs';
// Interfaces:
import { IDependency } from '../interfaces/dependency';
import { ISchema } from '../interfaces/schema';
// Services: 
import { displayMsgToStdOut } from './services/display-message';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.

const PACKAGE_LOCK_PATH = 'package-lock.json';
const WORKSPACE_PATH = 'workspace.json';
const NOT_IN_NX_WORKSPACE_MSG = 'Not an NX CLI workspace';
const SCHEMATICS_TEMPLATES_PATH = 'files'; // This path as relative to the root ./dist/nest folder

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

const filesToDelete = (pluginName: string): string[] => {
    const appDirectory = `apps/${pluginName}/src/app`;
    return [
        `${appDirectory}/app.controller.spec.ts`,
        `${appDirectory}/app.controller.ts`,
        `${appDirectory}/app.service.spec.ts`,
        `${appDirectory}/app.service.ts`,
        `${appDirectory}/app.service.ts`,
        PACKAGE_LOCK_PATH,
    ];
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

function deleteFiles(cb: Function, dasherizedPluginName: string, tree: Tree) {
    (cb(dasherizedPluginName) as string[]).forEach((file) => {
        if (existsSync(file)) {
            tree.delete(file);
        }
    });
}

function assignDependenciesToPackageJson(tree: Tree){
    DEPENDENCIES.forEach((dependency) => {
        const { name, version, type } = dependency;
        const dependencyDetails: NodeDependency = _nodeDependencyFactory(
            name,
            version,
            type,
        );
        addPackageJsonDependency(tree, dependencyDetails);
    });
}

export default function nest(options: ISchema): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const workspaceConfigBuffer = tree.read(WORKSPACE_PATH);

        if (!workspaceConfigBuffer) {
            throw new SchematicsException(NOT_IN_NX_WORKSPACE_MSG);
        }

        const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());

        const { pluginName } = options;

        const dasherizedPluginName = dasherize(pluginName);

        const pluginSrcFolderPath =
            workspaceConfig?.projects?.[dasherizedPluginName]?.sourceRoot;

        if (!pluginSrcFolderPath) {
            throw new SchematicsException(
                `Plugin ${dasherizedPluginName} not found`,
            );
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

        deleteFiles(filesToDelete, dasherizedPluginName, tree);

        assignDependenciesToPackageJson(tree)

        context.addTask(new NodePackageInstallTask());

        context.engine.executePostTasks().subscribe(() => {
            displayMsgToStdOut(DEPENDENCIES);
        });

        return mergeWith(sourceParameterizedTemplates)(tree, context);
    };
}
