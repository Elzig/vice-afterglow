const canvas = document.querySelector('#cover');
const ctx = canvas.getContext('2d');
const photoInput = document.querySelector('#photo');
const captionInput = document.querySelector('#caption');
const kickerInput = document.querySelector('#kicker');
const sizeInput = document.querySelector('#size');
const sourceInput = document.querySelector('#source');
const panelInput = document.querySelector('#panel');
const zoomInput = document.querySelector('#zoom');
const xInput = document.querySelector('#position-x');
const yInput = document.querySelector('#position-y');
const zoomValue = document.querySelector('#zoom-value');
const xValue = document.querySelector('#x-value');
const yValue = document.querySelector('#y-value');
const dimensions = document.querySelector('#dimensions');
const status = document.querySelector('#status');
const images = [];
const crops = [
  [{zoom:100,x:50,y:50},{zoom:100,x:50,y:50},{zoom:100,x:50,y:50}],
  [{zoom:100,x:50,y:50},{zoom:100,x:50,y:50},{zoom:100,x:50,y:50}],
];
let selectedPanel = 0;
const panelSources = [0,1,0];
const samplePaths = ['samples/boulevard.jpg','samples/pier.jpg'];
const sampleNames = ['Boulevard','Moon Pier'];
function loadImage(src,index){const image=new Image();image.onload=()=>{images[index]=image;render()};image.src=src}
samplePaths.forEach((src,i)=>loadImage(src,i));
function fitImage(image,x,y,zoom,w,h){if(!image)return;const scale=Math.max(w/image.width,h/image.height)*(zoom/100);const iw=image.width*scale,ih=image.height*scale;ctx.drawImage(image,(w-iw)*x/100,(h-ih)*y/100,iw,ih)}
function panelHeight(W,H){return H*.62}
function gradient(W,H){const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#ff704c99');g.addColorStop(.42,'#ff4e7d33');g.addColorStop(1,'#151b5999');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
function textFit(text,max,size){ctx.font=`900 ${size}px Arial Black,Arial,sans-serif`;while(ctx.measureText(text).width>max&&size>18){size-=2;ctx.font=`900 ${size}px Arial Black,Arial,sans-serif`}return size}
function render(){
  const [W,H]=sizeInput.value.split('x').map(Number);canvas.width=W;canvas.height=H;dimensions.textContent=`${W} × ${H}`;
  ctx.fillStyle='#111721';ctx.fillRect(0,0,W,H);
  const margin=W*.045, gap=W*.014, top=H*.07, bottom=H*.09, areaH=H-top-bottom;
  const heroH=areaH*.57, sideH=areaH-heroH-gap, heroW=W-margin*2;
  const panels=[{x:margin,y:top,w:heroW,h:heroH},{x:margin,y:top+heroH+gap,w:(heroW-gap)/2,h:sideH},{x:margin+(heroW+gap)/2,y:top+heroH+gap,w:(heroW-gap)/2,h:sideH}];
  panels.forEach((p,i)=>{ctx.save();ctx.beginPath();ctx.rect(p.x,p.y,p.w,p.h);ctx.clip();const source=panelSources[i],c=crops[source][i];fitImage(images[source],c.x,c.y,c.zoom,p.w,p.h);gradient(W,H);ctx.restore();ctx.strokeStyle='#f5d590aa';ctx.lineWidth=Math.max(2,W/500);ctx.strokeRect(p.x,p.y,p.w,p.h)});
  ctx.fillStyle='#f2c875';ctx.font=`700 ${Math.max(12,W/90)}px Arial,sans-serif`;ctx.letterSpacing='3px';ctx.fillText('VICE / AFTERGLOW',margin,top*.55);
  const title=captionInput.value.toUpperCase();const size=textFit(title,W*.83,W*.095);ctx.font=`900 ${size}px Arial Black,Arial,sans-serif`;ctx.lineWidth=Math.max(3,W/180);ctx.strokeStyle='#141823';ctx.fillStyle='#fff4dc';ctx.textAlign='center';ctx.strokeText(title,W/2,H-bottom*.63);ctx.fillText(title,W/2,H-bottom*.63);
  ctx.textAlign='left';ctx.font=`700 ${Math.max(12,W/70)}px Arial,sans-serif`;ctx.fillStyle='#79d9d0';ctx.fillText(kickerInput.value.toUpperCase(),margin,H-bottom*.22);
  ctx.textAlign='right';ctx.fillStyle='#f2c875';ctx.font=`700 ${Math.max(10,W/100)}px Arial,sans-serif`;ctx.fillText('01  /  ORIGINAL COVER',W-margin,H-bottom*.22);ctx.textAlign='left';
}
function sync(){const c=crops[sourceInput.value][selectedPanel];c.zoom=+zoomInput.value;c.x=+xInput.value;c.y=+yInput.value;zoomValue.textContent=`${c.zoom}%`;xValue.textContent=`${c.x}%`;yValue.textContent=`${c.y}%`;render()}
panelInput.addEventListener('change',()=>{selectedPanel=+panelInput.value;sourceInput.value=String(panelSources[selectedPanel]);const c=crops[sourceInput.value][selectedPanel];zoomInput.value=c.zoom;xInput.value=c.x;yInput.value=c.y;sync()});sourceInput.addEventListener('change',()=>{panelSources[selectedPanel]=+sourceInput.value;const c=crops[sourceInput.value][selectedPanel];zoomInput.value=c.zoom;xInput.value=c.x;yInput.value=c.y;sync()});[zoomInput,xInput,yInput].forEach(e=>e.addEventListener('input',sync));[captionInput,kickerInput,sizeInput].forEach(e=>e.addEventListener('input',render));
photoInput.addEventListener('change',()=>{[...photoInput.files].slice(0,2).forEach((file,i)=>{const r=new FileReader();r.onload=()=>loadImage(r.result,i);r.readAsDataURL(file)});status.textContent='Photo loaded locally — it never leaves this browser.'});
document.querySelectorAll('.sample').forEach(button=>button.addEventListener('click',()=>{const i=button.dataset.sample==='pier.jpg'?1:0;sourceInput.value=String(i);sourceInput.options[i].text=sampleNames[i];status.textContent=`Using ${sampleNames[i]} sample.`;render()}));
document.querySelector('#export').addEventListener('click',()=>{canvas.toBlob(blob=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`vice-afterglow-${sizeInput.value}.png`;a.click();URL.revokeObjectURL(a.href);status.textContent=`Exported PNG at ${sizeInput.value}.`},'image/png')});
render();
