import {memo, useEffect, useRef, useState} from 'react';
import Modal from '../../components/Modal';
import tictactoeIconUrl from './icons/tictactoe-icon.svg';
import closeButtonIconUrl from '../global-icons/close-button-icon.svg';
import './TicTacToe.scss';

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

type Status = 'idle' | 'loading' | 'active' | 'error';
type Player = 'x' | 'o';
type PromptKind = 'size' | 'square' | 'replay' | 'text';

interface PendingPrompt {
    raw: string;
    kind: PromptKind;
}

// Minimal surface of the Pyodide instance we actually use — the full type
// definitions ship with the `pyodide` npm package, which this lightweight
// CDN-script approach intentionally avoids depending on.
interface PyodideInterface {
    runPython: (code: string) => unknown;
    runPythonAsync: (code: string) => Promise<unknown>;
    setStdout: (options: { batched: (msg: string) => void }) => void;
    setStderr: (options: { batched: (msg: string) => void }) => void;
    globals: { set: (name: string, value: unknown) => void };
}

declare global {
    interface Window {
        loadPyodide?: () => Promise<PyodideInterface>;
    }
}

// The actual game logic from tictactoe.py (https://github.com/Antonio-Saucedo/cse210-01).
// The board logic, win-checking, and branching are untouched. Two mechanical
// changes were needed to drive it from clicks instead of a blocking terminal:
//   1. `from colorama import ...` becomes a shim emitting browser-safe
//      \x01COLOR\x02 markers instead of ANSI escape codes (see colorizeLine).
//   2. Every function that calls input() is now `async def`, and every
//      input() call is awaited — so the same input() call sites just pause
//      on a JS Promise (resolved by a button click) instead of blocking on
//      a keypress. No control flow, validation, or win logic changed.
const ASYNC_PYTHON_SOURCE = `
class Fore:
    RED = "\\x01RED\\x02"
    BLUE = "\\x01BLUE\\x02"
    GREEN = "\\x01GREEN\\x02"

class Style:
    BRIGHT = ""
    RESET_ALL = "\\x01RESET\\x02"

async def alphacheck(move, limit):
    while move.isalpha():
        print()
        print("Invalid Entry!")
        move = await input(f"choose a square (1-{limit}): ")
    while len(move) < 1:
        print()
        print("Invalid Entry!")
        move = await input(f"choose a square (1-{limit}): ")
    return move

async def main():
    selected = []
    player_turn = "o"
    size = await input("What board size would you like? 3 or 4? ")
    print()
    while (size != "3") & (size != "4"):
        print("Invalid Size!")
        size = await input("What board size would you like? 3 or 4? ")
        print()
    size_int = int(size)
    board = board_values(size_int)
    winner = "draw"
    while (not end(board, size_int)) & (winner != "x") & (winner != "o"):
        display_board(board, size_int)
        player_turn = player(player_turn)
        await turn(player_turn, board, size_int, selected)
        winner = win(board, size_int)
        print()
    display_board(board, size_int)
    print()
    if winner != "draw":
        print(f"{winner} is the winner!")
    else:
        print("It was a draw!")
    print(f"Good game! Thanks for playing!\\n")

def board_values(size):
    if size == 3:
        board = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
    else:
        board = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"]
    return board

def color_text(text):
    if text == "x":
        return Fore.RED + Style.BRIGHT + str(text) + " " + Style.RESET_ALL
    elif text == "o":
        return Fore.BLUE + Style.BRIGHT + str(text) + " " + Style.RESET_ALL
    else:
        return Fore.GREEN + Style.BRIGHT + str(text) + " " + Style.RESET_ALL

def display_board(board, size):
    if size == 3:
        print(color_text(board[0]) + color_text("|") + color_text(board[1]) + color_text("|") + color_text(board[2]))
        print(color_text("--+---+--"))
        print(color_text(board[3]) + color_text("|") + color_text(board[4]) + color_text("|") + color_text(board[5]))
        print(color_text("--+---+--"))
        print(color_text(board[6]) + color_text("|") + color_text(board[7]) + color_text("|") + color_text(board[8]))
    else:
        print(color_text(board[0]) + color_text("|") + color_text(board[1]) + color_text("|") + color_text(board[2])+ color_text("|") + color_text(board[3]))
        print(color_text("--+---+---+--"))
        print(color_text(board[4]) + color_text("|") + color_text(board[5]) + color_text("|") + color_text(board[6])+ color_text("|") + color_text(board[7]))
        print(color_text("--+---+---+--"))
        print(color_text(board[8]) + color_text("|") + color_text(board[9]) + color_text("|") + color_text(board[10])+ color_text("|") + color_text(board[11]))
        print(color_text("--+---+---+--"))
        print(color_text(board[12]) + color_text("|") + color_text(board[13]) + color_text("|") + color_text(board[14])+ color_text("|") + color_text(board[15]))

def player(player_turn):
    if player_turn == "o":
        return "x"
    else:
        return "o"

async def turn(player_turn, board, size, selected):
    print()
    if size == 3:
        move = await input(f"{player_turn}'s turn to choose a square (1-9): ")
        move = await alphacheck(move, 9)
        while (int(move) < 1) | (int(move) > 9) | (int(move) in selected):
            print()
            print("Invalid Entry!")
            move = await input(f"{player_turn}'s turn to choose a square (1-9): ")
            move = await alphacheck(move, 9)
    else:
        move = await input(f"{player_turn}'s turn to choose a square (1-16): ")
        move = await alphacheck(move, 16)
        while (int(move) < 1) | (int(move) > 16) | (int(move) in selected):
            print()
            print("Invalid Entry!")
            move = await input(f"{player_turn}'s turn to choose a square (1-16): ")
            move = await alphacheck(move, 16)
    selected.append(int(move))
    board[int(move) - 1] = player_turn

def win(board, size):
    if size == 3:
        if ((board[0] == "x") & (board[1] == "x") & (board[2] == "x")) | ((board[3] == "x") & (board[4] == "x") & (board[5] == "x")) |\\
((board[6] == "x") & (board[7] == "x") & (board[8] == "x")) | ((board[0] == "x") & (board[3] == "x") & (board[6] == "x")) |\\
((board[0] == "x") & (board[1] == "x") & (board[2] == "x")) | ((board[1] == "x") & (board[4] == "x") & (board[7] == "x")) |\\
((board[2] == "x") & (board[5] == "x") & (board[8] == "x")) | ((board[0] == "x") & (board[4] == "x") & (board[8] == "x")) |\\
((board[2] == "x") & (board[4] == "x") & (board[6] == "x")):
            return "x"
        elif ((board[0] == "o") & (board[1] == "o") & (board[2] == "o")) | ((board[3] == "o") & (board[4] == "o") & (board[5] == "o")) |\\
((board[6] == "o") & (board[7] == "o") & (board[8] == "o")) | ((board[0] == "o") & (board[3] == "o") & (board[6] == "o")) |\\
((board[0] == "o") & (board[1] == "o") & (board[2] == "o")) | ((board[1] == "o") & (board[4] == "o") & (board[7] == "o")) |\\
((board[2] == "o") & (board[5] == "o") & (board[8] == "o")) | ((board[0] == "o") & (board[4] == "o") & (board[8] == "o")) |\\
((board[2] == "o") & (board[4] == "o") & (board[6] == "o")):
            return "o"
        else:
            return "draw"
    else:
        if ((board[0] == "x") & (board[1] == "x") & (board[2] == "x") & (board[3] == "x")) | ((board[4] == "x") & (board[5] == "x") & (board[6] == "x") &\\
(board[7] == "x")) | ((board[8] == "x") & (board[9] == "x") & (board[10] == "x") & (board[11] == "x")) | ((board[12] == "x") & (board[13] == "x") &\\
(board[14] == "x") & (board[15] == "x")) | ((board[0] == "x") & (board[4] == "x") & (board[8] == "x") & (board[12] == "x")) | ((board[1] == "x") &\\
(board[5] == "x") & (board[9] == "x") & (board[13] == "x")) | ((board[2] == "x") & (board[6] == "x") & (board[10] == "x") & (board[14] == "x")) |\\
((board[3] == "x") & (board[7] == "x") & (board[11] == "x") & (board[15] == "x")) | ((board[0] == "x") & (board[5] == "x") & (board[10] == "x") &\\
(board[15] == "x")) | ((board[3] == "x") & (board[6] == "x") & (board[9] == "x") & (board[12] == "x")):
            return "x"
        elif ((board[0] == "o") & (board[1] == "o") & (board[2] == "o") & (board[3] == "o")) | ((board[4] == "o") & (board[5] == "o") & (board[6] == "o") &\\
(board[7] == "o")) | ((board[8] == "o") & (board[9] == "o") & (board[10] == "o") & (board[11] == "o")) | ((board[12] == "o") & (board[13] == "o") &\\
(board[14] == "o") & (board[15] == "o")) | ((board[0] == "o") & (board[4] == "o") & (board[8] == "o") & (board[12] == "o")) | ((board[1] == "o") &\\
(board[5] == "o") & (board[9] == "o") & (board[13] == "o")) | ((board[2] == "o") & (board[6] == "o") & (board[10] == "o") & (board[14] == "o")) |\\
((board[3] == "o") & (board[7] == "o") & (board[11] == "o") & (board[15] == "o")) | ((board[0] == "o") & (board[5] == "o") & (board[10] == "o") &\\
(board[15] == "o")) | ((board[3] == "o") & (board[6] == "o") & (board[9] == "o") & (board[12] == "o")):
            return "o"
        else:
            return "draw"

def end(board, size):
    for value in range(size * size):
        if (board[value - 1] != "x") & (board[value - 1] != "o"):
            return False
    return True

async def _run():
    continue_playing = True
    while continue_playing:
        await main()
        play_again = await input("Would you like to play again? ")
        while (play_again.lower() != 'y') & (play_again.lower() != 'yes') & (play_again.lower() != 'n') & (play_again.lower() != 'no'):
            print()
            print("Invalid Input!")
            play_again = await input("Would you like to play again? ")
        if (play_again.lower() == 'y') | (play_again.lower() == 'yes'):
            continue_playing = True
        elif (play_again.lower() == 'n') | (play_again.lower() == 'no'):
            continue_playing = False

await _run()
`;

// Loads the Pyodide <script> tag once, reusing it if already present
// (e.g. the modal was closed and reopened).
function loadPyodideScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Pyodide script'));
        document.body.appendChild(script);
    });
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Converts our \x01COLOR\x02 markers (from printed board lines) into styled spans.
function colorizeLine(line: string): string {
    const esc = escapeHtml(line);
    const parts = esc.split(/\x01(RED|BLUE|GREEN|RESET)\x02/);
    let html = '';
    let openClass: string | null = null;
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            const text = parts[i];
            if (!text) continue;
            html += openClass ? `<span class="${openClass}">${text}</span>` : text;
        } else {
            const tag = parts[i];
            if (tag === 'RED') openClass = 'ttt-x';
            else if (tag === 'BLUE') openClass = 'ttt-o';
            else if (tag === 'GREEN') openClass = 'ttt-board';
            else openClass = null; // RESET
        }
    }
    return html || '&nbsp;';
}

// Colors a leading "x" or "o" in a raw prompt string (e.g. "x's turn to
// choose a square (1-9): ") so the inline prompt matches the board's colors.
function colorizePromptPrefix(text: string): string {
    const match = text.match(/^([xo])(.*)$/s);
    if (!match) return escapeHtml(text);
    const cls = match[1] === 'x' ? 'ttt-x' : 'ttt-o';
    return `<span class="${cls}">${escapeHtml(match[1])}</span>${escapeHtml(match[2])}`;
}

// Module-level singleton so the Pyodide runtime (~6-10MB) only downloads
// once per page session, even if the modal is closed and reopened. The
// stdout/stderr/input callbacks are rebound on every call (below) so a
// fresh modal instance never ends up talking to a previous, unmounted one.
let pyodidePromise: Promise<PyodideInterface> | null = null;

async function getPyodide(
    onLine: (line: string) => void,
    onInputRequest: (promptText: string) => Promise<string>,
): Promise<PyodideInterface> {
    if (!pyodidePromise) {
        pyodidePromise = (async () => {
            await loadPyodideScript(PYODIDE_CDN);
            if (!window.loadPyodide) {
                throw new Error('Pyodide script loaded but window.loadPyodide is missing');
            }
            const pyodide = await window.loadPyodide();
            pyodide.runPython(`
import builtins

async def _custom_input(text=""):
    return await _js_request_input(text)

builtins.input = _custom_input
            `);
            return pyodide;
        })();
    }
    const pyodide = await pyodidePromise;
    // Rebind every time: these closures belong to the current component
    // instance, which changes each time the modal is reopened.
    pyodide.setStdout({batched: onLine});
    pyodide.setStderr({batched: onLine});
    pyodide.globals.set('_js_request_input', onInputRequest);
    return pyodide;
}

// Wrapped in memo() because the page's hero typewriter animation updates
// state in the top-level App component every ~40ms for as long as the tab
// is open — without memo, that re-renders this modal at the same rate,
// which shows up in DevTools as constant "flashing" even though nothing
// about the modal's own output ever changes. See App.tsx wiring notes for
// the matching useCallback on `onClose`, which memo needs to be effective.
function TicTacToe({isOpen, onClose}: Props) {
    const [status, setStatus] = useState<Status>('idle');
    const [lines, setLines] = useState<string[]>([
        'Press Start to boot the interpreter and load tictactoe.py\u2026',
    ]);
    const [pendingPrompt, setPendingPrompt] = useState<PendingPrompt | null>(null);
    const [board, setBoard] = useState<(Player | null)[] | null>(null);
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
    const [textAnswer, setTextAnswer] = useState('');

    const outputRef = useRef<HTMLDivElement>(null);
    const pendingResolveRef = useRef<((value: string) => void) | null>(null);
    const pendingRejectRef = useRef<((reason?: unknown) => void) | null>(null);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [lines, pendingPrompt]);

    if (!isOpen) return null;

    const appendLine = (line: string) => setLines(prev => [...prev, line]);

    const handlePrompt = (promptText: string) => {
        const turnMatch = promptText.match(/^([xo])'s turn to choose a square \(1-(\d+)\):\s?$/);
        if (turnMatch) {
            setCurrentPlayer(turnMatch[1] as Player);
            setPendingPrompt({raw: promptText, kind: 'square'});
            return;
        }
        if (promptText.startsWith('choose a square')) {
            setPendingPrompt({raw: promptText, kind: 'square'});
            return;
        }
        if (promptText.startsWith('What board size')) {
            setPendingPrompt({raw: promptText, kind: 'size'});
            return;
        }
        if (promptText.startsWith('Would you like to play again')) {
            setPendingPrompt({raw: promptText, kind: 'replay'});
            return;
        }
        // Fallback for any prompt we didn't anticipate — shouldn't happen
        // in normal play since every button only ever sends valid answers.
        setPendingPrompt({raw: promptText, kind: 'text'});
    };

    const requestInput = (promptText: string): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            pendingResolveRef.current = resolve;
            pendingRejectRef.current = reject;
            handlePrompt(promptText);
        });
    };

    // Resolves the pending input and records the prompt + chosen answer as
    // a permanent line in the console, so the transcript reads exactly like
    // a real terminal session: "x's turn to choose a square (1-9): 5".
    const answer = (value: string, echoLabel?: string) => {
        const resolve = pendingResolveRef.current;
        pendingResolveRef.current = null;
        pendingRejectRef.current = null;
        // Read pendingPrompt directly from this render's closure rather than
        // via a setState updater function — updater functions must be pure,
        // and React (in Strict Mode) intentionally invokes them twice in
        // development to catch side effects like this appendLine() call,
        // which was silently duplicating every echoed line.
        if (pendingPrompt) {
            appendLine(pendingPrompt.raw + (echoLabel ?? value));
        }
        setPendingPrompt(null);
        resolve?.(value);
    };

    const quitGame = () => {
        const reject = pendingRejectRef.current;
        pendingResolveRef.current = null;
        pendingRejectRef.current = null;
        setPendingPrompt(null);
        reject?.(new Error('Game exited by user'));
    };

    const chooseSize = (size: 3 | 4) => {
        const cellCount = size === 3 ? 9 : 16;
        setBoard(new Array(cellCount).fill(null));
        answer(String(size), `${size} x ${size}`);
    };

    const chooseSquare = (num: number) => {
        setBoard(prev => {
            const next = [...(prev ?? [])];
            next[num - 1] = currentPlayer;
            return next;
        });
        answer(String(num));
    };

    const chooseReplay = (yes: boolean) => {
        if (yes) {
            setBoard(null);
            setCurrentPlayer(null);
        }
        answer(yes ? 'y' : 'n', yes ? 'Yes' : 'No');
    };

    const submitTextAnswer = () => {
        const value = textAnswer;
        setTextAnswer('');
        answer(value);
    };

    const runGame = async () => {
        setStatus('loading');
        setLines(['Loading Python runtime\u2026']);
        setPendingPrompt(null);
        setBoard(null);
        setCurrentPlayer(null);
        try {
            const pyodide = await getPyodide(appendLine, requestInput);
            setStatus('active');
            setLines(['Interpreter ready. Game starting below.', '']);
            try {
                await pyodide.runPythonAsync(ASYNC_PYTHON_SOURCE);
                appendLine('\n[process exited normally]');
            } catch (err) {
                appendLine('\n[game exited]');
                console.error(err);
            }
            setStatus('idle');
            setPendingPrompt(null);
            setBoard(null);
        } catch (err) {
            setStatus('error');
            appendLine('Could not load the Python runtime. Check your connection and try again.');
            console.error(err);
        }
    };

    const startLabel = status === 'loading' ? 'Loading\u2026' : lines.length > 1 ? 'Restart' : 'Start';

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="tictactoe">
            <div className="modal-header">
                <span className="header-left-section">
                    <img src={tictactoeIconUrl} alt="Tic-tac-toe icon"/>
                </span>
                <span className="header-center-section">
                    <span className="header-title">Tic-Tac-Toe</span><br/>
                    <span className="header-subtitle">Real Python, running live via Pyodide (WebAssembly)</span>
                </span>
                <span className="header-right-section">
                    <button className="close-button" onClick={onClose}>
                        <img src={closeButtonIconUrl} alt="Close button icon"/>
                    </button>
                    <span className="badge">
                        <span className="badge-dot"></span>Python 3
                    </span>
                </span>
            </div>
            <div className="modal-body">
                <div className="ttt-terminal" ref={outputRef}>
                    {lines.map((line, i) => (
                        <div key={i} dangerouslySetInnerHTML={{__html: colorizeLine(line)}}/>
                    ))}

                    {pendingPrompt && (
                        <div className="ttt-prompt-row">
                            <span dangerouslySetInnerHTML={{__html: colorizePromptPrefix(pendingPrompt.raw)}}/>

                            {pendingPrompt.kind === 'size' && (
                                <span className="ttt-inline-choices">
                                    <button onClick={() => chooseSize(3)}>[3]</button>
                                    <button onClick={() => chooseSize(4)}>[4]</button>
                                </span>
                            )}

                            {pendingPrompt.kind === 'square' && board && (
                                <span className="ttt-inline-choices">
                                    {board.map((cell, i) => cell === null && (
                                        <button key={i} onClick={() => chooseSquare(i + 1)}>[{i + 1}]</button>
                                    ))}
                                </span>
                            )}

                            {pendingPrompt.kind === 'replay' && (
                                <span className="ttt-inline-choices">
                                    <button onClick={() => chooseReplay(true)}>[Yes]</button>
                                    <button onClick={() => chooseReplay(false)}>[No]</button>
                                </span>
                            )}

                            {pendingPrompt.kind === 'text' && (
                                <span className="ttt-inline-choices">
                                    <input
                                        className="ttt-text-input"
                                        autoFocus
                                        value={textAnswer}
                                        onChange={(e) => setTextAnswer(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && submitTextAnswer()}
                                    />
                                    <button onClick={submitTextAnswer}>[Send]</button>
                                </span>
                            )}
                        </div>
                    )}

                    {!pendingPrompt && <span className="ttt-cursor"/>}
                </div>
            </div>
            <div className="modal-footer">
                <span className="ttt-status">{status}</span>
                <span className="ttt-footer-actions">
                    <a
                        className="ttt-source-link"
                        href="https://github.com/Antonio-Saucedo/cse210-01"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View source
                    </a>
                    {status === 'active' ? (
                        <button className="ttt-quit-button" onClick={quitGame}>Quit</button>
                    ) : (
                        <button className="ttt-run-button" onClick={runGame} disabled={status === 'loading'}>
                            {startLabel}
                        </button>
                    )}
                </span>
            </div>
        </Modal>
    )
}

export default memo(TicTacToe);
