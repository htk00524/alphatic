const boardElem = document.getElementById('board');
const statusElem = document.getElementById('status');

const textureO = new Image();
const textureX = new Image();
textureO.src = 'img/pencil_o.png';
textureX.src = 'img/pencil_x.png';

let texturesLoaded = 0;
[textureO, textureX].forEach(tex => {
  tex.onload = () => {
    if (++texturesLoaded === 2) render();
  };
});

function drawCircle(ctx, size) {
  const center = size / 2;
  const radius = size * 0.35;
  ctx.clearRect(0, 0, size, size);
  const pattern = ctx.createPattern(textureO, 'repeat');
  ctx.strokeStyle = pattern || 'black';
  ctx.lineWidth = 6;

  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(center + (Math.random()-0.5)*1.5, center + (Math.random()-0.5)*1.5, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawCross(ctx, size) {
  ctx.clearRect(0, 0, size, size);
  const pattern = ctx.createPattern(textureX, 'repeat');
  ctx.strokeStyle = pattern || '#333';
  ctx.lineWidth = 6;

  for (let i = 0; i < 6; i++) {
    const offset = (Math.random() - 0.5) * 2;
    ctx.beginPath();
    ctx.moveTo(20 + offset, 20 + offset);
    ctx.lineTo(size - 20 + offset, size - 20 + offset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size - 20 + offset, 20 + offset);
    ctx.lineTo(20 + offset, size - 20 + offset);
    ctx.stroke();
  }
}

function render() {
  boardElem.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const canvas = document.createElement('canvas');
    canvas.dataset.index = i;
    canvas.width = canvas.height = 120 * window.devicePixelRatio;
    canvas.style.width = '120px';
    canvas.style.height = '120px';
    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    if (board[i] === PLAYER) drawCircle(ctx, 120);
    else if (board[i] === AI) drawCross(ctx, 120);

    boardElem.appendChild(canvas);
  }
}
