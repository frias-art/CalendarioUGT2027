/* Hoja de afiliacion a UGT: rellena el PDF oficial (afiliacion.pdf) en el propio movil.
   Los datos NO se guardan ni se envian a ningun servidor: solo salen cuando la persona comparte el PDF por correo. */
var AF_EMAIL="ssugtsmm@gmail.com";
/* WhatsApp del delegado/sección sindical (con prefijo, sin + ni espacios, ej. "34600123456"). Si se deja vacío, la persona elige el contacto. */
var AF_WHATSAPP="";
/* Datos de la empresa que se rellenan solos (el afiliado puede cambiarlos). Completa los que conozcas. */
var AF_EMPRESA={nombre:"CERVEZAS SAN MIGUEL S.L.U.",segsocial:"29132842883",cif:"B66363748",direccion:"CARRETERA AEROCLUB 1",cp:"29004",provincia:"MÁLAGA",municipio:"MÁLAGA",localidad:"MÁLAGA",convenio:"CERVEZAS SAN MIGUEL S.L.U."};

/* ---------- Relleno del PDF (funcion pura, se puede probar fuera del navegador) ---------- */
function afFill(PL,bytes,d,sigPng){
 return PL.PDFDocument.load(bytes).then(function(doc){return doc.embedFont(PL.StandardFonts.HelveticaBold).then(function(FB){
  var form=doc.getForm();
  function U(s){return String(s==null?"":s).toUpperCase().replace(/[^\x20-\x7E\xA0-\xFF]/g,"")}
  function put(n,v,sz){try{var f=form.getTextField(n);f.setText(U(v));f.setAlignment(PL.TextAlignment.Center);if(sz)f.setFontSize(sz)}catch(e){}}
  function putL(n,v){try{var f=form.getTextField(n),t=U(v),w=f.acroField.getWidgets()[0].getRectangle().width-4,sz=9;if(FB&&t){var tw=FB.widthOfTextAtSize(t,1);if(tw*sz>w)sz=Math.max(5,Math.floor(w/tw*10)/10)}f.setText(t);f.setFontSize(sz)}catch(e){}}
  function boxes(prefix,pad,v,n,start){v=U(v).replace(/[\s.\-\/]/g,"");for(var i=0;i<v.length&&i<n;i++)put(prefix+(pad?("000"+(i+start)).slice(-pad):(i+start)),v[i],10)}
  function X(n,on){if(on)put(n,"X",9)}
  var iso=function(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||"");return m?m[3]+m[2]+m[1]:""};
  function fecha(prefix,s,p){var t=iso(s);for(var i=0;i<t.length;i++){var k=i<2?"D"+(i+1):i<4?"M"+(i-1):"A"+(i-3);put(prefix+" "+k,t[i],10)}}
  boxes("DNI ",2,d.dni,10,1);
  fecha("FEC NACIMIENTO",d.nac);
  X("HOMBRE",d.sexo=="H");X("MUJER",d.sexo=="M");
  putL("PAIS Y PROVINCIA NACIMIENTO",d.paisnac);putL("NACIONALIDAD",d.nacionalidad);
  putL("NOMBRE",d.nombre);putL("PRIMER APELLIDO",d.ap1);putL("SEGUNDO APELLIDO",d.ap2);
  putL("DIRECCIÓN POSTAL",d.dir);boxes("CODPOSTAL",0,d.cp,5,0);
  putL("PROVINCIA DATOS PERSONALES",d.prov);putL("MUNICIPIO DATOS PERSONALES",d.mun);putL("LOCALIDAD DATOS PERSONALES",d.loc);
  putL("TELÉFONO DE CONTACTO",d.tel);putL("EMAIL DE CONTACTO",String(d.email||"").toLowerCase());
  var oc={aut:"AUTONOMO",soc:"ECONOMIA SOCIAL",jub:"JUBILADO-PENSIONISTA",pre:"PREJUBILADO",priv:"ASALARIADO SECTOR PRIVADO",pub:"ASALARIADO SECTOR PUBLICO",par1:"PARADO-BUSCA PRIMER EMPLEO",par2:"PARADO-TRABAJO ANTES"};
  X(oc[d.ocup],1);if(d.ocup=="par2")putL("PARADO DONDE TRABAJO ANTES",d.parado);
  putL("EMPRESA O ENTIDAD NOMBRE",d.emp);boxes("NUM SEG SOC EMPRESA ",3,d.ss,11,0);
  var cif=U(d.cif).replace(/[\s.\-]/g,"");for(var i=0;i<cif.length&&i<9;i++)put("CIF EMPRESA "+("000"+(i+2)).slice(-3),cif[i],10);
  putL("DIRECCION POSTALEMPRESA",d.empdir);boxes("CODPOSTALEMPRESA",0,d.empcp,5,1);
  putL("PROVINCIA DE LA EMPRESA",d.empprov);putL("MUNICIPIO DE LA EMPRESA",d.empmun);putL("LOCALIDAD DE LA EMPRESA",d.emploc);
  var te={priv:"TIPO DE EMPRESA PRIVADA",pub:"TIPO DE EMPRESA  PUBLICA",aso:"TIPO DE EMPRESA ASOCIACION",aut:"TIPO DE EMPRESA AUTONOMA"};X(te[d.tipoemp],1);
  fecha("FEC ALTA EN EMPRESA",d.altaemp);
  X("TRABAJAS COMO TECNICO SI",d.tecnico=="S");X("TRABAJAS COMO TECNICO NO",d.tecnico=="N");
  putL("PUESTO DE TRABAJO",d.puesto);putL("CATEGORIA PROFESIONAL",d.cat);putL("CONVENIO DE REFERENCIA",d.convenio);
  var tc={fijo:"FIJO",fd:"FIJO DISCONTINUO",tp:"TIEMPO PARCIAL",temp:"TEMPORAL",func:"FUNCIONARIO/A",inter:"INTERINIDAD"};X(tc[d.contrato],1);
  X("SI AUTORIZO",d.terceros);
  if(d.pago=="banco"){
   putL("TITULAR DE LA CUENTA",d.titular);putL("DIRECCIÓN DEL DEUDOR",d.bdir);boxes("CODPOSTAL DOMICILIACION ",0,d.bcp,5,1);
   putL("POBLACION DOMICILIACION",d.bpob);putL("PROVINCIA DOMICILIACION",d.bprov);putL("PAIS DOMICILIACION",d.bpais);
   boxes("SWIFT BIC ",0,d.bic,11,1);boxes("IBAN ",0,d.iban,24,1);
   X("PAGO RECURRENTE",d.tpago!="unico");X("PAGO UNICO",d.tpago=="unico");
   putL("FECHA-LOCALIDAD",d.lugar)}
  else{
   putL("NOMBRE DEL AFILIADOA deudora",[d.nombre,d.ap1,d.ap2].join(" ").replace(/\s+/g," ").trim());
   boxes("DNI CONFORME ALTA ",2,d.dni,10,1)}
  var pages=doc.getPages(),p1=pages[0],p2=pages[1];
  return Promise.resolve(FB).then(function(fb){
   form.updateFieldAppearances(fb);
   return (sigPng?doc.embedPng(sigPng):Promise.resolve(null)).then(function(img){
    function sign(pg,x,y,w,h){if(!img)return;var s=Math.min(w/img.width,h/img.height);pg.drawImage(img,{x:x+(w-img.width*s)/2,y:y+(h-img.height*s)/2,width:img.width*s,height:img.height*s})}
    p1.drawText("X",{x:407.5,y:798,size:10,font:fb,color:PL.rgb(0,0,0)});   /* MODALIDAD: ALTA */
    sign(p1,418,262,154,78);
    if(d.pago=="banco")sign(p1,458,40,112,64);else sign(p2,442,40,128,70);
    form.flatten();
    /* Limpieza: el PDF oficial trae scripts JavaScript del formulario; WhatsApp/Android avisan de "archivo dañino" si los ven. Se eliminan junto con el formulario ya aplanado. */
    var N=PL.PDFName,ctx=doc.context;
    ctx.enumerateIndirectObjects().forEach(function(e){var o=e[1];if(o&&typeof o.has==="function"&&(o.has(N.of("JS"))||o.has(N.of("JavaScript")))){try{ctx.delete(e[0])}catch(x){}}
     if(o&&typeof o.has==="function"&&o.has(N.of("AA"))){try{o.delete(N.of("AA"))}catch(x){}}});
    ["AcroForm","AA","OpenAction","Names"].forEach(function(k){try{doc.catalog.delete(N.of(k))}catch(x){}});
    doc.setTitle("Hoja de afiliación a UGT");doc.setProducer("Calendario Laboral 2027");
    return doc.save({useObjectStreams:false})})})})})}

/* ---------- Validaciones ---------- */
function afDni(v){v=String(v||"").toUpperCase().replace(/[\s\-]/g,"");var L="TRWAGMYFPDXBNJZSQVHLCKE",m;
 if(m=/^(\d{8})([A-Z])$/.exec(v))return L[+m[1]%23]==m[2];
 if(m=/^([XYZ])(\d{7})([A-Z])$/.exec(v))return L[+(("XYZ".indexOf(m[1]))+m[2])%23]==m[3];
 return v.length>=5}
function afIban(v){v=String(v||"").toUpperCase().replace(/\s/g,"");if(!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(v))return false;
 var r=v.slice(4)+v.slice(0,4),s="";for(var i=0;i<r.length;i++){var c=r.charCodeAt(i);s+=c>64?c-55:r[i]}
 var m=0;for(var j=0;j<s.length;j++)m=(m*10+ +s[j])%97;return m==1}

/* ---------- Interfaz ---------- */
if(typeof document!=="undefined"){(function(){
var css='#af{position:fixed;inset:0;z-index:110;background:#f4f2ec;overflow-y:auto;font-family:Outfit,-apple-system,system-ui,sans-serif;color:#17231d;display:none;-webkit-overflow-scrolling:touch}#af.on{display:block}'+
'#af *{box-sizing:border-box}#af .w{max-width:680px;margin:0 auto;padding:0 16px calc(110px + env(safe-area-inset-bottom,0px))}'+
'#af .hd{background:linear-gradient(150deg,#0b3a2b,#14624a);color:#fff;margin:0 -16px 14px;padding:calc(14px + env(safe-area-inset-top,0px)) 16px 18px;border-radius:0 0 24px 24px;position:relative}'+
'#af .hd h2{margin:0;font-size:22px}#af .hd p{margin:4px 0 0;font-size:13px;opacity:.85}#af .x{position:absolute;right:12px;top:calc(10px + env(safe-area-inset-top,0px));width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.18);color:#fff;border:0;font-size:20px}'+
'#af .c{background:#fff;border:1px solid #e4e1d6;border-radius:18px;padding:14px;margin-bottom:12px}#af .c h3{margin:0 0 10px;font-size:15px;color:#0b3a2b}'+
'#af label{display:block;font-size:12px;color:#6d7a72;margin:10px 0 3px;font-weight:500}#af label i{color:#d6232a;font-style:normal}'+
'#af input[type=text],#af input[type=tel],#af input[type=email],#af input[type=date],#af select{width:100%;padding:11px 12px;border:1px solid #d9d5c7;border-radius:12px;font:inherit;font-size:16px;background:#faf9f4;color:#17231d;text-transform:uppercase}#af input[type=email]{text-transform:none}'+
'#af input.err,#af .sig.err{border-color:#d6232a;background:#fdeeee}'+
'#af .r2{display:grid;grid-template-columns:1fr 1fr;gap:10px}#af .r3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}'+
'#af .ch{display:flex;flex-wrap:wrap;gap:8px;margin-top:2px}#af .ch label{margin:0;padding:9px 12px;border:1px solid #d9d5c7;border-radius:12px;font-size:14px;color:#17231d;background:#faf9f4;display:flex;gap:6px;align-items:center}#af .ch input{accent-color:#14624a}'+
'#af .ck{display:flex;gap:10px;align-items:flex-start;font-size:13px;color:#17231d;margin:10px 0 0}#af .ck input{margin-top:3px;width:20px;height:20px;accent-color:#14624a;flex:none}'+
'#af .sig{border:2px dashed #b9b4a3;border-radius:14px;background:#fff;height:150px;touch-action:none;display:block;width:100%}#af .sg{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#6d7a72;margin-top:6px}#af .sg button{border:0;background:none;text-decoration:underline;font:inherit;color:#6d7a72}'+
'#af .bar{position:fixed;left:0;right:0;bottom:0;background:rgba(244,242,236,.96);backdrop-filter:blur(6px);padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px));border-top:1px solid #e4e1d6}#af .bar>div{max-width:680px;margin:0 auto;display:flex;gap:8px}'+
'#af .b{flex:1;padding:14px;border-radius:14px;border:0;background:#d6232a;color:#fff;font:inherit;font-weight:700;font-size:16px}#af .b.g{background:#14624a}#af .b.s{background:#f0ede3;color:#17231d;font-weight:600}'+
'#af .nt{font-size:12.5px;color:#6d7a72;line-height:1.45;margin:0 2px 12px}#af .st{display:flex;gap:10px;align-items:flex-start;margin:10px 0;font-size:14px}#af .st>b{flex:none;width:26px;height:26px;border-radius:50%;background:#14624a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px}'+
'#af .hid{display:none}#af-cta{margin:14px 16px 0;padding:14px;border-radius:18px;background:linear-gradient(150deg,#d6232a,#a3171d);color:#fff;display:flex;align-items:center;gap:12px;width:calc(100% - 32px);text-align:left;border:0;font-family:inherit}#af-cta b{display:block;font-size:16px}#af-cta small{opacity:.9;font-size:13px}#af-cta span{font-size:26px;flex:none}';
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

var $=function(i){return document.getElementById(i)};
function opt(name,list,def){return'<div class="ch">'+list.map(function(x){return'<label><input type="radio" name="'+name+'" value="'+x[0]+'"'+(x[0]==def?" checked":"")+'>'+x[1]+"</label>"}).join("")+"</div>"}
function inp(id,lab,v,o){o=o||{};return"<label>"+lab+(o.req?" <i>*</i>":"")+'</label><input id="'+id+'" type="'+(o.t||"text")+'" value="'+(v||"")+'"'+(o.m?' maxlength="'+o.m+'"':"")+(o.im?' inputmode="'+o.im+'"':"")+(o.ac?' autocomplete="'+o.ac+'"':"")+">"}
var E=AF_EMPRESA;
var HTML='<div class="w"><div class="hd"><button class="x" onclick="afClose()" aria-label="Cerrar">×</button><h2>Hoja de afiliación a UGT</h2><p>Rellénala aquí y se genera el PDF oficial, listo para enviar a tu sección sindical.</p></div>'+
'<div id="af-form">'+
'<p class="nt">Tus datos <b>no se guardan ni se envían a ningún servidor</b>: se quedan en tu móvil y solo salen cuando tú envías el correo. Los campos con <i style="color:#d6232a;font-style:normal">*</i> son obligatorios.</p>'+
'<div class="c"><h3>Datos personales</h3>'+inp("af-nombre","Nombre","",{req:1,ac:"given-name"})+'<div class="r2"><div>'+inp("af-ap1","1º apellido","",{req:1,ac:"family-name"})+'</div><div>'+inp("af-ap2","2º apellido","")+"</div></div>"+
inp("af-dni","DNI / NIE / Pasaporte","",{req:1,m:12})+'<div class="r2"><div>'+inp("af-nac","Fecha de nacimiento","",{t:"date",req:1})+"</div><div><label>Sexo <i>*</i></label>"+opt("af-sexo",[["H","Hombre"],["M","Mujer"]],"")+"</div></div>"+
inp("af-paisnac","País / provincia de nacimiento","",{})+inp("af-nacionalidad","Nacionalidad","ESPAÑOLA")+
inp("af-dir","Dirección postal","",{req:1,ac:"street-address"})+'<div class="r2"><div>'+inp("af-cp","Código postal","",{req:1,m:5,im:"numeric",ac:"postal-code"})+'</div><div>'+inp("af-prov","Provincia","MÁLAGA")+"</div></div>"+
'<div class="r2"><div>'+inp("af-mun","Municipio","")+'</div><div>'+inp("af-loc","Localidad","")+"</div></div>"+
inp("af-tel","Teléfono de contacto","",{req:1,t:"tel",ac:"tel"})+inp("af-email","Email","",{req:1,t:"email",ac:"email"})+"</div>"+
'<div class="c"><h3>Datos laborales</h3><label>Ocupación</label><select id="af-ocup"><option value="priv">Asalariado/a sector privado</option><option value="pub">Asalariado/a sector público</option><option value="aut">Autónomo/a</option><option value="soc">Economía social</option><option value="jub">Jubilado/a o pensionista</option><option value="pre">Prejubilado/a</option><option value="par1">Parado/a busca su primer empleo</option><option value="par2">Parado/a trabajó antes</option></select>'+
'<div id="af-parw" class="hid">'+inp("af-parado","Sector / empresa donde trabajaste","")+"</div>"+
inp("af-emp","Empresa o entidad",E.nombre)+inp("af-ss","Nº Seguridad Social de la empresa",E.segsocial,{m:14,im:"numeric"})+inp("af-cif","CIF de la empresa",E.cif,{m:10})+
inp("af-empdir","Dirección del centro de trabajo",E.direccion)+'<div class="r2"><div>'+inp("af-empcp","Código postal",E.cp,{m:5,im:"numeric"})+'</div><div>'+inp("af-empprov","Provincia",E.provincia)+"</div></div>"+
'<div class="r2"><div>'+inp("af-empmun","Municipio",E.municipio)+'</div><div>'+inp("af-emploc","Localidad",E.localidad)+"</div></div>"+
"<label>Tipo de empresa</label>"+opt("af-tipoemp",[["priv","Privada"],["pub","Pública"],["aso","Asociación"],["aut","Autónomo/a"]],"priv")+
inp("af-altaemp","Fecha de alta en la empresa","",{t:"date"})+"<label>¿Trabajas como técnico/a?</label>"+opt("af-tecnico",[["S","Sí"],["N","No"]],"N")+
inp("af-puesto","Puesto de trabajo","")+inp("af-cat","Categoría profesional","")+inp("af-convenio","Convenio de referencia",E.convenio)+
"<label>Tipo de contrato</label>"+opt("af-contrato",[["fijo","Fijo"],["fd","Fijo discontinuo"],["tp","Tiempo parcial"],["temp","Temporal"],["func","Funcionario/a"],["inter","Interinidad"]],"fijo")+"</div>"+
'<div class="c"><h3>Pago de la cuota</h3>'+opt("af-pago",[["nomina","Descuento en nómina"],["banco","Domiciliación bancaria"]],"nomina")+
'<p class="nt" id="af-nominanota" style="margin-top:10px">Se rellena la hoja de «conformidad de alta y autorización de descuento en nómina» (página 2). Tipo de cuota y periodicidad los completa UGT.</p>'+
'<div id="af-bancow" class="hid">'+inp("af-titular","Titular de la cuenta","",{})+inp("af-bdir","Dirección del titular","")+'<div class="r2"><div>'+inp("af-bcp","Código postal","",{m:5,im:"numeric"})+'</div><div>'+inp("af-bpob","Población","")+'</div></div><div class="r2"><div>'+inp("af-bprov","Provincia","MÁLAGA")+'</div><div>'+inp("af-bpais","País","ESPAÑA")+"</div></div>"+
inp("af-iban","IBAN (ES + 22 dígitos)","",{m:34})+inp("af-bic","SWIFT / BIC (opcional)","",{m:11})+"<label>Tipo de pago</label>"+opt("af-tpago",[["rec","Recurrente"],["unico","Pago único"]],"rec")+"</div></div>"+
'<div class="c"><h3>Firma y consentimiento</h3>'+
'<div class="ck"><input type="checkbox" id="af-terceros"><label for="af-terceros" style="margin:0;font-size:13px;color:#17231d">Autorizo recibir comunicaciones sobre servicios de terceros con condiciones especiales por ser afiliado/a (opcional).</label></div>'+
'<div class="ck"><input type="checkbox" id="af-rgpd"><label for="af-rgpd" style="margin:0;font-size:13px;color:#17231d">He leído la información de protección de datos (cláusula RGPD de la hoja, responsable: UGT) y quiero afiliarme. <i style="color:#d6232a;font-style:normal">*</i></label></div>'+
'<label>Firma con el dedo <i>*</i></label><canvas class="sig" id="af-sig"></canvas><div class="sg"><span>Firma dentro del recuadro</span><button type="button" onclick="afSigClear()">Borrar firma</button></div>'+
inp("af-lugar","Localidad de firma","MÁLAGA")+"</div>"+
'<div class="bar"><div><button class="b" onclick="afGen()">Generar mi hoja de afiliación</button></div></div></div>'+
'<div id="af-res" class="hid"></div></div>';

var el=document.createElement("div");el.id="af";el.innerHTML=HTML;
var app=document.getElementById("cl-app")||document.body;app.appendChild(el);
function v(i){var e=$(i);return e?String(e.value||"").trim():""}
function r(n){var e=el.querySelector('input[name="'+n+'"]:checked');return e?e.value:""}
function showHide(){$("af-parw").className=v("af-ocup")=="par2"?"":"hid";var b=r("af-pago")=="banco";$("af-bancow").className=b?"":"hid";$("af-nominanota").className="nt"+(b?" hid":"")}
el.addEventListener("change",function(e){showHide();if(e.target.id=="af-dir"||0){}});
showHide();
/* firma */
var cv=$("af-sig"),cx,drawn=false,down=false,lx=0,ly=0;
function fit(){var rc=cv.getBoundingClientRect(),dp=Math.max(2,window.devicePixelRatio||1);if(!rc.width)return;var old=drawn?cv.toDataURL():null;cv.width=Math.round(rc.width*dp);cv.height=Math.round(rc.height*dp);cx=cv.getContext("2d");cx.scale(dp,dp);cx.lineWidth=2.4;cx.lineCap="round";cx.lineJoin="round";cx.strokeStyle="#111"}
function pos(e){var rc=cv.getBoundingClientRect();return[e.clientX-rc.left,e.clientY-rc.top]}
cv.addEventListener("pointerdown",function(e){if(!cx)fit();down=true;var p=pos(e);lx=p[0];ly=p[1];cx.beginPath();cx.arc(lx,ly,1.2,0,7);cx.fill();drawn=true;cv.classList.remove("err");try{cv.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()});
cv.addEventListener("pointermove",function(e){if(!down)return;var p=pos(e);cx.beginPath();cx.moveTo(lx,ly);cx.lineTo(p[0],p[1]);cx.stroke();lx=p[0];ly=p[1];e.preventDefault()});
["pointerup","pointercancel","pointerleave"].forEach(function(n){cv.addEventListener(n,function(){down=false})});
window.afSigClear=function(){drawn=false;fit()};

var pdfBlob=null,fname="ficha-afiliacion-UGT.pdf";
function loadJs(src){return new Promise(function(ok,ko){var s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=function(){ko(new Error("No se pudo cargar "+src))};document.head.appendChild(s)})}
function bad(id,m){var e=$(id);if(e){e.classList.add("err");e.scrollIntoView({block:"center",behavior:"smooth"})}toast_(m);return false}
function toast_(m){if(window.toast)window.toast(m);else alert(m)}
function clearErr(){el.querySelectorAll(".err").forEach(function(e){e.classList.remove("err")})}
function dataFromForm(){var b=r("af-pago")=="banco";return{dni:v("af-dni"),nac:v("af-nac"),sexo:r("af-sexo"),paisnac:v("af-paisnac"),nacionalidad:v("af-nacionalidad"),nombre:v("af-nombre"),ap1:v("af-ap1"),ap2:v("af-ap2"),dir:v("af-dir"),cp:v("af-cp"),prov:v("af-prov"),mun:v("af-mun"),loc:v("af-loc"),tel:v("af-tel"),email:v("af-email"),
 ocup:v("af-ocup"),parado:v("af-parado"),emp:v("af-emp"),ss:v("af-ss"),cif:v("af-cif"),empdir:v("af-empdir"),empcp:v("af-empcp"),empprov:v("af-empprov"),empmun:v("af-empmun"),emploc:v("af-emploc"),tipoemp:r("af-tipoemp"),altaemp:v("af-altaemp"),tecnico:r("af-tecnico"),puesto:v("af-puesto"),cat:v("af-cat"),convenio:v("af-convenio"),contrato:r("af-contrato"),
 terceros:$("af-terceros").checked,pago:b?"banco":"nomina",titular:v("af-titular")||[v("af-nombre"),v("af-ap1"),v("af-ap2")].join(" "),bdir:v("af-bdir")||v("af-dir"),bcp:v("af-bcp")||v("af-cp"),bpob:v("af-bpob")||v("af-loc")||v("af-mun"),bprov:v("af-bprov"),bpais:v("af-bpais"),iban:v("af-iban"),bic:v("af-bic"),tpago:r("af-tpago"),
 lugar:(v("af-lugar")?v("af-lugar")+", ":"")+(new Date().getDate()+"/"+(new Date().getMonth()+1)+"/"+new Date().getFullYear())}}
window.afGen=function(){
 clearErr();
 if(!v("af-nombre"))return bad("af-nombre","Falta tu nombre");
 if(!v("af-ap1"))return bad("af-ap1","Falta tu primer apellido");
 if(!v("af-dni")||!afDni(v("af-dni")))return bad("af-dni","Revisa el DNI / NIE (la letra no coincide)");
 if(!v("af-nac"))return bad("af-nac","Falta la fecha de nacimiento");
 if(!r("af-sexo"))return toast_("Indica el sexo")||false;
 if(!v("af-dir"))return bad("af-dir","Falta la dirección");
 if(!/^\d{5}$/.test(v("af-cp")))return bad("af-cp","El código postal tiene 5 dígitos");
 if(!v("af-tel"))return bad("af-tel","Falta el teléfono");
 if(!/^\S+@\S+\.\S+$/.test(v("af-email")))return bad("af-email","Revisa el email (es obligatorio)");
 if(r("af-pago")=="banco"&&!afIban(v("af-iban")))return bad("af-iban","El IBAN no es válido, revísalo");
 if(!$("af-rgpd").checked)return toast_("Marca que has leído la información de protección de datos")||false;
 if(!drawn)return(cv.classList.add("err"),cv.scrollIntoView({block:"center",behavior:"smooth"}),toast_("Falta tu firma"),false);
 var btn=el.querySelector(".bar .b");btn.textContent="Generando…";btn.disabled=true;
 var d=dataFromForm(),sig=cv.toDataURL("image/png").split(",")[1],sb=Uint8Array.from(atob(sig),function(c){return c.charCodeAt(0)});
 Promise.all([window.PDFLib?0:loadJs("pdf-lib.min.js"),fetch("afiliacion.pdf").then(function(x){if(!x.ok)throw new Error("No se encuentra afiliacion.pdf");return x.arrayBuffer()})])
 .then(function(a){return afFill(window.PDFLib,a[1],d,sb)})
 .then(function(out){pdfBlob=new Blob([out],{type:"application/pdf"});
  fname="ficha-afiliacion-UGT-"+(d.nombre+"-"+d.ap1).toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^A-Z0-9]+/g,"-")+".pdf";
  result(d)})
 .catch(function(e){toast_("No se pudo generar el PDF: "+e.message)})
 .then(function(){btn.textContent="Generar mi hoja de afiliación";btn.disabled=false})}
function result(d){
 $("af-form").className="hid";var s=$("af-res");s.className="";
 s.innerHTML='<div class="c"><h3>¡Tu hoja está lista!</h3><p class="nt" style="margin:0">Se ha generado el PDF oficial de afiliación con tus datos y tu firma. Ahora envíalo a tu sección sindical:</p>'+
 '<div class="st"><b>1</b><div>Pulsa <b>«Enviar por WhatsApp»</b> o <b>«Enviar por correo»</b> y elige la aplicación. El PDF va adjunto.</div></div>'+
 '<div class="st"><b>2</b><div>Elige el contacto de tu sección sindical. Para el correo, el destinatario es <b>'+AF_EMAIL+'</b> (cópialo con el botón de abajo si no sale rellenado).</div></div>'+
 '<div class="st"><b>3</b><div>Pulsa enviar. Tu delegado de UGT se pondrá en contacto contigo.</div></div></div>'+
 '<div class="c"><button class="b g" style="width:100%;margin-bottom:8px;background:#1fa855" onclick="afWa()">Enviar por WhatsApp</button><button class="b g" style="width:100%;margin-bottom:8px" onclick="afSend()">Enviar por correo</button>'+
 '<button class="b s" style="width:100%;margin-bottom:8px" onclick="afDown()">Descargar PDF</button>'+
 '<button class="b s" style="width:100%;margin-bottom:8px" onclick="afMail()">Abrir correo a '+AF_EMAIL+'</button>'+
 '<button class="b s" style="width:100%" onclick="afCopy()">Copiar la dirección de correo</button>'+
 '<p class="nt" style="margin:12px 0 0">Si el envío no adjunta el PDF en tu móvil: pulsa <b>Descargar PDF</b> y adjúntalo tú desde WhatsApp o desde el correo.</p></div>'+
 '<button class="b s" style="width:100%" onclick="afBack()">‹ Volver a editar mis datos</button>';
 el.scrollTo(0,0)}
function mailBody(){return"Hola, adjunto mi hoja de afiliación a UGT cumplimentada y firmada.\n\nGracias."}
window.afSend=function(){if(!pdfBlob)return;var f=new File([pdfBlob],fname,{type:"application/pdf"});
 if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:"Hoja de afiliación UGT",text:"Para: "+AF_EMAIL+"\n\n"+mailBody()}).catch(function(){})}
 else{afDown();setTimeout(afMail,600);toast_("PDF descargado: adjúntalo al correo")}}
window.afWa=function(){if(!pdfBlob)return;var f=new File([pdfBlob],fname,{type:"application/pdf"}),t="Hola, te envío mi hoja de afiliación a UGT cumplimentada y firmada.";
 if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:"Hoja de afiliación UGT",text:t}).catch(function(){});return}
 afDown();toast_("PDF descargado: adjúntalo en el chat de WhatsApp");setTimeout(function(){window.open("https://wa.me/"+AF_WHATSAPP+"?text="+encodeURIComponent(t),"_blank")},900)};
window.afDown=function(){if(!pdfBlob)return;var a=document.createElement("a");a.href=URL.createObjectURL(pdfBlob);a.download=fname;document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(a.href)},4000)};
window.afMail=function(){location.href="mailto:"+AF_EMAIL+"?subject="+encodeURIComponent("Solicitud de afiliación UGT")+"&body="+encodeURIComponent(mailBody()+"\n\n(Adjunta el PDF descargado)")};
window.afCopy=function(){if(navigator.clipboard)navigator.clipboard.writeText(AF_EMAIL).then(function(){toast_("Dirección copiada")});else toast_(AF_EMAIL)};
window.afBack=function(){$("af-res").className="hid";$("af-form").className="";el.scrollTo(0,0)};
window.afOpen=function(){el.classList.add("on");document.body.style.overflow="hidden";setTimeout(fit,50)};
window.afClose=function(){el.classList.remove("on");document.body.style.overflow=""};
})()}
