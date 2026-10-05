const sharp = require('C:/Users/jjg39/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async () => {
 const source='image/trophy/trophy-rotation-sheet.png';
 const meta=await sharp(source).metadata();
 const width=280,height=380;
 const frames=[];
 for(let i=0;i<12;i++) {
  const col=i%4,row=Math.floor(i/4);
  const left=Math.round(col*meta.width/4),top=Math.round(row*meta.height/3);
  const w=Math.round((col+1)*meta.width/4)-left,h=Math.round((row+1)*meta.height/3)-top;
  const {data,info}=await sharp(source).extract({left,top,width:w,height:h}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let x0=w,y0=h,x1=0,y1=0;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(data[(y*w+x)*4+3]>160) {
   x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
  }
  const tile=await sharp(data,{raw:info}).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).resize({height:340}).png().toBuffer();
  const size=await sharp(tile).metadata();
  const frame=await sharp({create:{width,height,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:tile,left:Math.round((width-size.width)/2),top:20}]).raw().toBuffer();
  frames.push(frame);
 }
 const order=[0,1,2,3,4,5,6,7,8,9,10,11,10,9,8,7,6,5,4,3,2,1];
 await sharp(Buffer.concat(order.map(i=>frames[i])),{raw:{width,height:height*order.length,channels:4,pageHeight:height}}).gif({loop:0,delay:order.map(i=>(i===0||i===11)?450:150),dither:0.5,effort:7}).toFile('image/trophy/trophy-rotation-preview.gif');
 console.log(await sharp('image/trophy/trophy-rotation-preview.gif',{animated:true}).metadata());
})();
