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
import { unlinkSync, existsSync } from 'fs';
console.log(parseName, buildDefaultPath);
// You don't have to export the function as default. You can also have more than one rule factory
// per file.

const packageLockPath = 'package-lock.json';
const workspacePath = 'workspace.json';
const notInNxMsg = 'Not an NX CLI workspace';
const schematicTemplatesPath = 'files';
const DEPENDENCIES: [string, string][] = [
    ['elastic-apm-node', '^3.6.1'],
    ['@nestjs/swagger', '^4.5.7'],
    ['swagger-ui-express', '^4.1.4'],
    ['compression', '^1.7.4'],
    ['helmet', '^3.22.0'],
    ['@types/helmet', '^0.0.48'],
];

export function nest(options: ISchema): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const workspaceConfigBuffer = tree.read(workspacePath);
        if (!workspaceConfigBuffer) {
            throw new SchematicsException(notInNxMsg);
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
        const sourceTemplates = url(schematicTemplatesPath);
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
        displayMsgToStdOut();
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
    if (existsSync(packageLockPath)) {
        unlinkSync(packageLockPath);
    }
}

function displayMsgToStdOut(): void {
    const stdOutMessages = [
        yellow('\n\n  ___        _____._____.   .__                                  ___     '),
        yellow(' / _ \\_/\\  _/ ____\\__\\_ |__ |__|     ____  _________________    / _ \\_/\\ '),
        yellow(' \\/ \\___/  \\   __\\|  || __ \\|  |   _/ ___\\/  _ \\_  __ \\____ \\   \\/ \\___/ '),
        yellow('            |  |  |  || \\_\\ \\  |   \\  \\__(  <_> )  | \\/  |_> >           '),
        yellow('            |__|  |__||___  /__| /\\ \\___  >____/|__|  |   __/            '),
        yellow('                          \\/     \\/     \\/            |__|               \n\n'),
        yellow(
            bold(
                underline('This is a custom Mataf NX-NestJS dedicated plugin schematic\n'),
            ),
        ),
        yellow('* Address placeholders and provide useful content'),
        yellow('* Confirm APM ports are open and ready.'),
        yellow(
            '* Subsequently, uncomment the APM configurations in the main.ts file.\n\n',
        ),
    ];
    for (const msg of stdOutMessages) {
        console.log(msg);
    }
}
