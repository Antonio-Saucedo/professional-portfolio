import{n as e,r as t,t as n}from"./index-BkBgv5Ov.js";import{n as r,t as i}from"./close-button-icon-D-kqFn31.js";var a=t(e(),1),o=`data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23011B2E'%20stroke-width='1.5'%20stroke-linecap='round'%20stroke-linejoin='round'%20width='30'%20height='30'%3e%3cline%20x1='9'%20y1='3'%20x2='9'%20y2='21'/%3e%3cline%20x1='15'%20y1='3'%20x2='15'%20y2='21'/%3e%3cline%20x1='3'%20y1='9'%20x2='21'%20y2='9'/%3e%3cline%20x1='3'%20y1='15'%20x2='21'%20y2='15'/%3e%3cline%20x1='4.5'%20y1='4.5'%20x2='7.5'%20y2='7.5'/%3e%3cline%20x1='7.5'%20y1='4.5'%20x2='4.5'%20y2='7.5'/%3e%3ccircle%20cx='12'%20cy='12'%20r='2'%20fill='none'/%3e%3cline%20x1='16.5'%20y1='16.5'%20x2='19.5'%20y2='19.5'/%3e%3cline%20x1='19.5'%20y1='16.5'%20x2='16.5'%20y2='19.5'/%3e%3c/svg%3e`,s=n(),c=`https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js`,l=`
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
`;function u(e){return new Promise((t,n)=>{if(document.querySelector(`script[src="${e}"]`)){t();return}let r=document.createElement(`script`);r.src=e,r.onload=()=>t(),r.onerror=()=>n(Error(`Failed to load Pyodide script`)),document.body.appendChild(r)})}function d(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function f(e){let t=d(e).split(/\x01(RED|BLUE|GREEN|RESET)\x02/),n=``,r=null;for(let e=0;e<t.length;e++)if(e%2==0){let i=t[e];if(!i)continue;n+=r?`<span class="${r}">${i}</span>`:i}else{let n=t[e];r=n===`RED`?`ttt-x`:n===`BLUE`?`ttt-o`:n===`GREEN`?`ttt-board`:null}return n||`&nbsp;`}function p(e){let t=e.match(/^([xo])(.*)$/s);return t?`<span class="${t[1]===`x`?`ttt-x`:`ttt-o`}">${d(t[1])}</span>${d(t[2])}`:d(e)}var m=null;async function h(e,t){m||=(async()=>{if(await u(c),!window.loadPyodide)throw Error(`Pyodide script loaded but window.loadPyodide is missing`);let e=await window.loadPyodide();return e.runPython(`
import builtins

async def _custom_input(text=""):
    return await _js_request_input(text)

builtins.input = _custom_input
            `),e})();let n=await m;return n.setStdout({batched:e}),n.setStderr({batched:e}),n.globals.set(`_js_request_input`,t),n}function g({isOpen:e,onClose:t}){let[n,c]=(0,a.useState)(`idle`),[u,d]=(0,a.useState)([`Press Start to boot the interpreter and load tictactoe.py…`]),[m,g]=(0,a.useState)(null),[_,v]=(0,a.useState)(null),[y,b]=(0,a.useState)(null),[x,S]=(0,a.useState)(``),C=(0,a.useRef)(null),w=(0,a.useRef)(null),T=(0,a.useRef)(null);if((0,a.useEffect)(()=>{C.current&&(C.current.scrollTop=C.current.scrollHeight)},[u,m]),!e)return null;let E=e=>d(t=>[...t,e]),D=e=>{let t=e.match(/^([xo])'s turn to choose a square \(1-(\d+)\):\s?$/);if(t){b(t[1]),g({raw:e,kind:`square`});return}if(e.startsWith(`choose a square`)){g({raw:e,kind:`square`});return}if(e.startsWith(`What board size`)){g({raw:e,kind:`size`});return}if(e.startsWith(`Would you like to play again`)){g({raw:e,kind:`replay`});return}g({raw:e,kind:`text`})},O=e=>new Promise((t,n)=>{w.current=t,T.current=n,D(e)}),k=(e,t)=>{let n=w.current;w.current=null,T.current=null,m&&E(m.raw+(t??e)),g(null),n?.(e)},A=()=>{let e=T.current;w.current=null,T.current=null,g(null),e?.(Error(`Game exited by user`))},j=e=>{v(Array(e===3?9:16).fill(null)),k(String(e),`${e} x ${e}`)},M=e=>{v(t=>{let n=[...t??[]];return n[e-1]=y,n}),k(String(e))},N=e=>{e&&(v(null),b(null)),k(e?`y`:`n`,e?`Yes`:`No`)},P=()=>{let e=x;S(``),k(e)},F=async()=>{c(`loading`),d([`Loading Python runtime…`]),g(null),v(null),b(null);try{let e=await h(E,O);c(`active`),d([`Interpreter ready. Game starting below.`,``]);try{await e.runPythonAsync(l),E(`
[process exited normally]`)}catch(e){E(`
[game exited]`),console.error(e)}c(`idle`),g(null),v(null)}catch(e){c(`error`),E(`Could not load the Python runtime. Check your connection and try again.`),console.error(e)}},I=n===`loading`?`Loading…`:u.length>1?`Restart`:`Start`;return(0,s.jsxs)(r,{isOpen:e,onClose:t,className:`tictactoe`,children:[(0,s.jsxs)(`div`,{className:`modal-header`,children:[(0,s.jsx)(`span`,{className:`header-left-section`,children:(0,s.jsx)(`img`,{src:o,alt:`Tic-tac-toe icon`})}),(0,s.jsxs)(`span`,{className:`header-center-section`,children:[(0,s.jsx)(`span`,{className:`header-title`,children:`Tic-Tac-Toe`}),(0,s.jsx)(`br`,{}),(0,s.jsx)(`span`,{className:`header-subtitle`,children:`Real Python, running live via Pyodide (WebAssembly)`})]}),(0,s.jsxs)(`span`,{className:`header-right-section`,children:[(0,s.jsx)(`button`,{className:`close-button`,onClick:t,children:(0,s.jsx)(`img`,{src:i,alt:`Close button icon`})}),(0,s.jsxs)(`span`,{className:`badge`,children:[(0,s.jsx)(`span`,{className:`badge-dot`}),`Python 3`]})]})]}),(0,s.jsx)(`div`,{className:`modal-body`,children:(0,s.jsxs)(`div`,{className:`ttt-terminal`,ref:C,children:[u.map((e,t)=>(0,s.jsx)(`div`,{dangerouslySetInnerHTML:{__html:f(e)}},t)),m&&(0,s.jsxs)(`div`,{className:`ttt-prompt-row`,children:[(0,s.jsx)(`span`,{dangerouslySetInnerHTML:{__html:p(m.raw)}}),m.kind===`size`&&(0,s.jsxs)(`span`,{className:`ttt-inline-choices`,children:[(0,s.jsx)(`button`,{onClick:()=>j(3),children:`[3]`}),(0,s.jsx)(`button`,{onClick:()=>j(4),children:`[4]`})]}),m.kind===`square`&&_&&(0,s.jsx)(`span`,{className:`ttt-inline-choices`,children:_.map((e,t)=>e===null&&(0,s.jsxs)(`button`,{onClick:()=>M(t+1),children:[`[`,t+1,`]`]},t))}),m.kind===`replay`&&(0,s.jsxs)(`span`,{className:`ttt-inline-choices`,children:[(0,s.jsx)(`button`,{onClick:()=>N(!0),children:`[Yes]`}),(0,s.jsx)(`button`,{onClick:()=>N(!1),children:`[No]`})]}),m.kind===`text`&&(0,s.jsxs)(`span`,{className:`ttt-inline-choices`,children:[(0,s.jsx)(`input`,{className:`ttt-text-input`,autoFocus:!0,value:x,onChange:e=>S(e.target.value),onKeyDown:e=>e.key===`Enter`&&P()}),(0,s.jsx)(`button`,{onClick:P,children:`[Send]`})]})]}),!m&&(0,s.jsx)(`span`,{className:`ttt-cursor`})]})}),(0,s.jsxs)(`div`,{className:`modal-footer`,children:[(0,s.jsx)(`span`,{className:`ttt-status`,children:n}),(0,s.jsxs)(`span`,{className:`ttt-footer-actions`,children:[(0,s.jsx)(`a`,{className:`ttt-source-link`,href:`https://github.com/Antonio-Saucedo/cse210-01`,target:`_blank`,rel:`noopener noreferrer`,children:`View source`}),n===`active`?(0,s.jsx)(`button`,{className:`ttt-quit-button`,onClick:A,children:`Quit`}):(0,s.jsx)(`button`,{className:`ttt-run-button`,onClick:F,disabled:n===`loading`,children:I})]})]})]})}var _=(0,a.memo)(g);export{_ as default};