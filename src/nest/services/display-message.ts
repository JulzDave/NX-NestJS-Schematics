import { yellow, underline, bold } from 'chalk';
import { IDependency } from '../dependency';
var align = require('align-text');
var columnify = require('columnify');
const boxen = require('boxen');

function centerAlign(len: number) {
    return Math.floor((process.stdout.columns - len) / 2);
}

function sortDependencies(dependencies: IDependency[]) {
    return dependencies.sort((firstEl, secondEl) =>
        secondEl.name > firstEl.name ? -1 : 1,
    );
}

export function displayMsgToStdOut(dependencies: IDependency[]): void {
    const sortedDependencies = sortDependencies(dependencies);
    const columns = columnify(sortedDependencies, {
        columns: ['name', 'version'],
        config: { version: { align: 'right' } },
    });
    const stdOutMessages = [
        boxen(columns, { padding: 1 }),
        yellow('\n\n'),
        yellow(
            align(
                '   ______   ___  ___      _         __  ______      ______       _            _        ______   ',
                centerAlign,
            ),
        ),
        yellow(
            align(
                '  / / / /   |  \\/  |     | |       / _| | ___ \\___  |  _  \\     | |          | |       \\ \\ \\ \\  ',
                centerAlign,
            ),
        ),
        yellow(
            align(
                ' / / / /    | .  . | __ _| |_ __ _| |_  | |_/ ( _ ) | | | |   __| | ___ _ __ | |_       \\ \\ \\ \\ ',
                centerAlign,
            ),
        ),
        yellow(
            align(
                "< < < <     | |\\/| |/ _` | __/ _` |  _| |    // _ \\/\\ | | |  / _` |/ _ \\ '_ \\| __|       > > > >",
                centerAlign,
            ),
        ),
        yellow(
            align(
                ' \\ \\ \\ \\    | |  | | (_| | || (_| | |   | |\\ \\ (_>  < |/ /  | (_| |  __/ |_) | |_ _     / / / / ',
                centerAlign,
            ),
        ),
        yellow(
            align(
                '  \\_\\_\\_\\   \\_|  |_/\\__,_|\\__\\__,_|_|   \\_| \\_\\___/\\/___/    \\__,_|\\___| .__/ \\__(_)   /_/_/_/  ',
                centerAlign,
            ),
        ),
        yellow(
            align(
                '                                                                     | |                    ',
                centerAlign,
            ),
        ),
        yellow(
            align(
                '                                                                     |_|                    ',
                centerAlign,
            ),
        ),
        yellow('\n'),
        yellow(
            bold(
                align(
                    underline(
                        'This is a custom Mataf NX-NestJS dedicated plugin schematic',
                    ),
                    centerAlign,
                ),
            ),
        ),
        yellow(
            bold(
                align(
                    underline(
                        'Follow the steps below to take full advantage of this schematic:',
                    ),
                    centerAlign,
                ),
            ),
        ),
        yellow('\n'),
        yellow('* Replace placeholders with useful content.'),
        yellow(
            '* Confirm APM ports are open and ready. If affirmative, uncomment the APM configuration snippets in the main.ts file.',
        ),
        yellow('* Seperate sensitive data into dedicated ENV files.'),
    ];
    let index: number = 0;
    const startDisplayingMsg = setInterval(() => {
        console.log(stdOutMessages[index]);
        index++;
        if (index >= stdOutMessages.length) {
            clearInterval(startDisplayingMsg);
        }
    }, 75);
}
