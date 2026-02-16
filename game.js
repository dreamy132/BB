const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
const grid=8;
let cell;
let board;
let score=0;
let coins=parseInt(localStorage.getItem("coins"))||0;
let highScore=parseInt(localStorage.getItem("high"))||0;
let selected=null;
let musicOn=false;
let audioCtx=new (window.AudioContext||window.webkitAudioContext)();

function resize(){
  const size=Math.min(window.innerWidth-20,400);
  canvas.width=size;
  canvas.height=size;
  cell=size/grid;
}
window.addEventListener("resize",resize);
resize();

function init(){
  board=Array.from({length:grid},()=>Array(grid).fill(0));
  score=0;
  updateHUD();
  newPieces();
  draw();
}
init();

const shapes=[
  [[1]],[[1,1]],[[1],[1]],
  [[1,1,1]],[[1],[1],[1]],
  [[1,1],[1,1]],
  [[1,1,1],[0,1,0]]
];

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let y=0;y<grid;y++){
    for(let x=0;x<grid;x++){
      ctx.fillStyle=board[y][x]?"#00f5d4":"#222";
      ctx.fillRect(x*cell,y*cell,cell-2,cell-2);
    }
  }
}

function canPlace(shape,gx,gy){
  for(let y=0;y<shape.length;y++){
    for(let x=0;x<shape[y].length;x++){
      if(shape[y][x]){
        if(!board[gy+y]||board[gy+y][gx+x]) return false;
      }
    }
  }
  return true;
}

function place(shape,gx,gy){
  if(!canPlace(shape,gx,gy)) return false;
  shape.forEach((row,y)=>{
    row.forEach((v,x)=>{
      if(v) board[gy+y][gx+x]=1;
    });
  });
  clearLines();
  draw();
  return true;
}

function clearLines(){
  let cleared=0;

  for(let i=0;i<grid;i++){
    if(board[i].every(v=>v)){
      board[i].fill(0);
      cleared++;
    }
  }

  for(let x=0;x<grid;x++){
    if(board.every(r=>r[x])){
      for(let y=0;y<grid;y++) board[y][x]=0;
      cleared++;
    }
  }

  if(cleared){
    score+=cleared*10;
    coins+=cleared*2;
    playSound(500);
  }

  if(score>highScore){
    highScore=score;
    localStorage.setItem("high",highScore);
  }

  localStorage.setItem("coins",coins);
  updateHUD();
}

function updateHUD(){
  scoreEl.innerText=score;
  highEl.innerText=highScore;
  coinsEl.innerText=coins;
}

const scoreEl=document.getElementById("score");
const highEl=document.getElementById("high");
const coinsEl=document.getElementById("coins");

function newPieces(){
  const container=document.getElementById("pieces");
  container.innerHTML="";
  for(let i=0;i<3;i++){
    const shape=shapes[Math.floor(Math.random()*shapes.length)];
    const mini=document.createElement("canvas");
    mini.width=70; mini.height=70;
    const m=mini.getContext("2d");
    shape.forEach((row,y)=>{
      row.forEach((v,x)=>{
        if(v){
          m.fillStyle="#00f5d4";
          m.fillRect(x*18,y*18,16,16);
        }
      });
    });
    mini.onclick=()=>selected=shape;
    container.appendChild(mini);
  }
}

canvas.addEventListener("click",e=>{
  if(!selected) return;
  const rect=canvas.getBoundingClientRect();
  const gx=Math.floor((e.clientX-rect.left)/cell);
  const gy=Math.floor((e.clientY-rect.top)/cell);
  if(place(selected,gx,gy)){
    selected=null;
    newPieces();
    checkGameOver();
  }
});

function checkGameOver(){
  for(const shape of shapes){
    for(let y=0;y<grid;y++){
      for(let x=0;x<grid;x++){
        if(canPlace(shape,x,y)) return;
      }
    }
  }
  setTimeout(()=>{
    alert("Game Over! Score: "+score);
    init();
  },200);
}

function useBomb(){
  if(coins<20) return alert("Not enough coins!");
  coins-=20;
  for(let i=0;i<5;i++){
    board[Math.floor(Math.random()*grid)][Math.floor(Math.random()*grid)]=0;
  }
  updateHUD();
  draw();
}

function dailyReward(){
  const last=localStorage.getItem("daily");
  const today=new Date().toDateString();
  if(last===today) return alert("Already claimed today!");
  coins+=50;
  localStorage.setItem("daily",today);
  updateHUD();
}

function playSound(freq){
  const osc=audioCtx.createOscillator();
  osc.frequency.value=freq;
  osc.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime+0.1);
}

function toggleMusic(){
  if(!musicOn){
    const osc=audioCtx.createOscillator();
    osc.frequency.value=220;
    osc.connect(audioCtx.destination);
    osc.start();
    setTimeout(()=>osc.stop(),10000);
    musicOn=true;
  } else {
    musicOn=false;
  }
}
