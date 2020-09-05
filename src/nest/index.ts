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
import { writeFileSync } from 'fs';
import { tail, head, stubString } from 'lodash';
console.log(parseName, buildDefaultPath);
// You don't have to export the function as default. You can also have more than one rule factory
// per file.

const STUB_STRING = stubString();

function recursiveObjInsersion(
    data: Record<string, any> = {},
    props = [STUB_STRING],
    finalValue: any = STUB_STRING,
) {
    if (props.length > 1) {
        const firstProp = head(props) as string;
        const newData = data[firstProp];
        const newProps = tail(props);
        recursiveObjInsersion(newData, newProps, finalValue);
        return;
    } else {
        const firstProp = head(props) as string;
        data[firstProp] = finalValue;
    }
}

function insertToJson(
    path: string,
    data: object,
    props: string[],
    finalValue: any,
) {
    recursiveObjInsersion(data, props, finalValue);
    writeFileSync(path, JSON.stringify(data, null, 4));
}
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
        const packageJsonConfig: Record<string, any> = JSON.parse(
            packageJsonConfigBuffer.toString(),
        );

        const targetDependencies = [
            {
                path: './package.json',
                data: packageJsonConfig,
                propsAndValues: [
                    {
                        props: ['dependencies', 'new-prop1'],
                        finalValue: 'answer',
                    },
                    {
                        props: ['dependencies', 'new-prop2'],
                        finalValue: 'answer',
                    },
                    {
                        props: ['dependencies', 'new-prop3'],
                        finalValue: 'answer',
                    },
                    {
                        props: ['dependencies', 'new-prop4'],
                        finalValue: 'answer',
                    },
                ],
            },
        ];

        for (const dependency of targetDependencies) {
            for (const propsAndValue of dependency.propsAndValues) {
                insertToJson(
                    dependency.path,
                    dependency.data,
                    propsAndValue.props,
                    propsAndValue.finalValue,
                );
            }
        }

        const pluginName = _options.pluginName;
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
                ..._options,
                ...strings,
                name,
            }),
            move(foundPlugin),
        ]);
        return mergeWith(sourceParameterizedTemplates)(tree, _context);
    };
}
