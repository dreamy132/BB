const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
const grid=8;
let cell;
let board;
let score=0;
let level=1;
let coins=parseInt(localStorage.getItem("coins"))||0;
let highScore=parseInt(localStorage.getItem("high"))||0;
let gamesPlayed=parseInt(localStorage.getItem("games"))||0;
let totalClears=parseInt(localStorage.getItem("clears"))||0;
let selected=null;
let particles=[];

function resize(){
  const size=Math.min(window.innerWidth-20,420);
  canvas.width=size;
  canvas.height=size;
  cell=size/grid;
}
window.addEventListener("resize",resize);
resize();

function init(){
  board=Array.from({length:grid},()=>Array(grid).fill(0));
  score=0;
  level=1;
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

  particles.forEach(p=>{
    ctx.fillStyle="white";
    ctx.fillRect(p.x,p.y,4,4);
    p.y-=p.speed;
  });

  particles=particles.filter(p=>p.y>0);
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
      spawnParticles(i);
      cleared++;
    }
  }

  for(let x=0;x<grid;x++){
    if(board.every(r=>r[x])){
      for(let y=0;y<grid;y++) board[y][x]=0;
      spawnParticles(x);
      cleared++;
    }
  }

  if(cleared){
    score+=cleared*10*level;
    coins+=cleared*3;
    totalClears+=cleared;

    if(score>level*300){
      level++;
    }
  }

  if(score>highScore){
    highScore=score;
    localStorage.setItem("high",highScore);
  }

  localStorage.setItem("coins",coins);
  localStorage.setItem("clears",totalClears);
  updateHUD();
}

function spawnParticles(line){
  for(let i=0;i<20;i++){
    particles.push({
      x:Math.random()*canvas.width,
      y:line*cell,
      speed:Math.random()*4+2
    });
  }
}

function updateHUD(){
  scoreEl.innerText=score;
  highEl.innerText=highScore;
  coinsEl.innerText=coins;
  levelEl.innerText=level;
}

const scoreEl=document.getElementById("score");
const highEl=document.getElementById("high");
const coinsEl=document.getElementById("coins");
const levelEl=document.getElementById("level");

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
    mini.onmousedown=()=>selected=shape;
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
  gamesPlayed++;
  localStorage.setItem("games",gamesPlayed);
  setTimeout(()=>{
    alert("Game Over! Score: "+score);
    init();
  },200);
}

function useBomb(){
  if(coins<25) return alert("Not enough coins!");
  coins-=25;
  for(let i=0;i<6;i++){
    board[Math.floor(Math.random()*grid)][Math.floor(Math.random()*grid)]=0;
  }
  updateHUD();
  draw();
}

function openCrate(){
  if(coins<50) return alert("Need 50 coins!");
  coins-=50;
  const reward=Math.floor(Math.random()*3);
  if(reward===0) coins+=100;
  if(reward===1) score+=200;
  if(reward===2) level++;
  alert("Loot Crate Reward Unlocked!");
  updateHUD();
}

function showStats(){
  const panel=document.getElementById("statsPanel");
  panel.style.display="block";
  panel.innerHTML=`
    <h3>Stats</h3>
    Games Played: ${gamesPlayed}<br>
    Total Clears: ${totalClears}<br>
    High Score: ${highScore}
  `;
}
