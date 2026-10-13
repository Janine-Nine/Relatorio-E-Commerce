const cats=[
 {name:"Logística",keys:["atras","demor","entrega","frete","rastream","transport","extravi","pedido não chegou","prazo","entregue","correio","retirada"],focus:"atraso, frete, entrega, rastreamento, transportadora"},
 {name:"Qualidade",keys:["defeit","quebrad","avari","qualidade","material","durabilidade","danific","faltando peça","produto diferente","embalagem"],focus:"defeito, avaria, material, durabilidade, produto divergente"},
 {name:"Usabilidade",keys:["site","aplicativo","app","checkout","pagamento","cadastro","senha","navega","lento","erro","carrinho","finalizar compra","pix","cartão"],focus:"checkout, navegação, cadastro, pagamento, desempenho"},
 {name:"Outros",keys:[],focus:"atendimento, comunicação, troca, elogios e sugestões"}
];
const demoA={"Logística":16,"Qualidade":10,"Usabilidade":8,"Outros":6};
const demoB={"Logística":19,"Qualidade":9,"Usabilidade":11,"Outros":7};
let countsA={...demoA},countsB={...demoB},isDemo=true;
function classify(line){
 const s=line.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
 let found=[];
 for(const c of cats.slice(0,3)){
   if(c.keys.some(k=>s.includes(k.normalize("NFD").replace(/[\u0300-\u036f]/g,"")))) found.push(c.name);
 }
 return found[0]||"Outros";
}
function render(){
 const totalA=Object.values(countsA).reduce((a,b)=>a+b,0),totalB=Object.values(countsB).reduce((a,b)=>a+b,0);
 const groupA=document.getElementById("nameA").value.trim()||"Grupo A";
 const groupB=document.getElementById("nameB").value.trim()||"Grupo B";
 document.getElementById("totalA").textContent=totalA;document.getElementById("totalB").textContent=totalB;
 document.getElementById("labelA").textContent=groupA+" · "+(isDemo?"exemplo":"dados informados");
 document.getElementById("labelB").textContent=groupB+" · "+(isDemo?"exemplo":"dados informados");
 document.getElementById("legendA").textContent=groupA;
 document.getElementById("legendB").textContent=groupB;
 const top=[...cats].sort((x,y)=>countsB[y.name]-countsB[x.name])[0];
 document.getElementById("topCategory").textContent=top&&countsB[top.name]>0?top.name:"—";
 const chart=document.getElementById("chart");chart.innerHTML="";
 const max=Math.max(1,...Object.values(countsA),...Object.values(countsB));
 cats.forEach(c=>{
  const row=document.createElement("div");row.className="bar-row";
  const label=document.createElement("div");label.className="bar-label";label.textContent=c.name;
  const pair=document.createElement("div");pair.className="bar-pair";
  [[countsA[c.name],"barfill a"],[countsB[c.name],"barfill b"]].forEach(([v,cl])=>{
   const line=document.createElement("div");line.className="barline";const fill=document.createElement("div");fill.className=cl;fill.style.width=(v/max*100)+"%";fill.textContent=v;line.appendChild(fill);pair.appendChild(line);
  });row.append(label,pair);chart.appendChild(row);
 });
 const tb=document.getElementById("categoryTable");tb.innerHTML="";
 cats.forEach(c=>{const tr=document.createElement("tr");tr.innerHTML=`<td><strong>${c.name}</strong></td><td>${countsA[c.name]}</td><td>${countsB[c.name]}</td><td>${c.focus}</td>`;tb.appendChild(tr)});
 const diffs=cats.map(c=>({name:c.name,a:countsA[c.name],b:countsB[c.name],diff:countsB[c.name]-countsA[c.name]})).sort((x,y)=>Math.abs(y.diff)-Math.abs(x.diff));
 const interpretation=document.getElementById("interpretation");
 if(totalA+totalB===0){
  interpretation.textContent="Não há feedbacks classificados para comparar. Insira comentários nos campos abaixo e atualize o relatório.";
 }else{
  interpretation.innerHTML=diffs.slice(0,3).map(x=>{
   const amount=Math.abs(x.diff);
   const noun=amount===1?"feedback":"feedbacks";
   return `<p><strong>${x.name}:</strong> ${x.diff>0?"aumentou":x.diff<0?"diminuiu":"ficou estável"} em ${amount} ${noun} (${x.a} → ${x.b}). ${x.diff>0?"Investigue os casos antes de ampliar a intervenção.":x.diff<0?"Verifique se a redução se mantém em períodos equivalentes.":"Acompanhe para detectar mudanças."}</p>`;
  }).join("");
 }
 const executive=totalA+totalB===0
  ?"Ainda não há feedbacks classificados. Insira comentários para gerar uma leitura inicial; os resultados representam volumes absolutos e não comprovam mudanças na taxa de problemas."
  :`No ${isDemo?"cenário ilustrativo":"conjunto informado"}, ${top&&countsB[top.name]>0?top.name:"nenhuma categoria com registros"} é a categoria mais frequente no ${groupB}. Priorize a investigação dos relatos mais recorrentes e compare os volumes com o número de pedidos em cada período. O volume absoluto, isoladamente, não comprova uma mudança na taxa de problemas nem identifica a causa.`;
 document.getElementById("executive").textContent=executive;
 document.getElementById("budget").textContent="R$ 0–2.600";
}
function analyze(){
 const lines=id=>document.getElementById(id).value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
 const a=lines("dataA"),b=lines("dataB");
 countsA=Object.fromEntries(cats.map(c=>[c.name,0]));countsB=Object.fromEntries(cats.map(c=>[c.name,0]));
 a.forEach(x=>countsA[classify(x)]++);b.forEach(x=>countsB[classify(x)]++);
 isDemo=false;render();
 document.getElementById("status").textContent=a.length||b.length
  ?`Classificação concluída: ${a.length} feedback(s) no Grupo A e ${b.length} no Grupo B. Revise manualmente os casos ambíguos.`
  :"Nenhum feedback informado. Os indicadores foram zerados.";
}
function reset(){
 countsA={...demoA};countsB={...demoB};isDemo=true;
 document.getElementById("dataA").value="";document.getElementById("dataB").value="";
 document.getElementById("nameA").value="Período anterior";document.getElementById("nameB").value="Período atual";
 document.getElementById("status").textContent="Exemplo demonstrativo restaurado; os números são fictícios.";render();
}
document.getElementById("analyze").addEventListener("click",analyze);
document.getElementById("reset").addEventListener("click",reset);
document.getElementById("download").addEventListener("click",()=>{
 const rows=[["Categoria",document.getElementById("nameA").value,document.getElementById("nameB").value],...cats.map(c=>[c.name,countsA[c.name],countsB[c.name]])];
 const csvCell=value=>{
  const safeValue=typeof value==="string"&&/^\s*[=+\-@]/.test(value)?`'${value}`:value;
  return '"'+String(safeValue).replace(/"/g,'""')+'"';
 };
 const csv="\uFEFF"+rows.map(row=>row.map(csvCell).join(";")).join("\r\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="relatorio-feedbacks-ecommerce.csv";link.click();setTimeout(()=>URL.revokeObjectURL(url),0);
});
render();