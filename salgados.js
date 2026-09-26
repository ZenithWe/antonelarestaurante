const catalog = [
  { id:'coxinha', name:'Coxinha', icon:'🥟', tag:'Frito', desc:'Selecione a quantidade de pacotes. Cada pacote corresponde a 10 unidades.' },
  { id:'quibe', name:'Quibe', icon:'🧆', tag:'Frito', desc:'Selecione a quantidade de pacotes. Cada pacote corresponde a 10 unidades.' },
  { id:'bolinha', name:'Bolinha', icon:'🧀', tag:'Frito', desc:'Selecione a quantidade de pacotes. Cada pacote corresponde a 10 unidades.' },
  { id:'empada', name:'Empada', icon:'🥧', tag:'Assado', desc:'Selecione a quantidade de pacotes. Cada pacote corresponde a 10 unidades.' },
  { id:'pastel', name:'Pastel', icon:'🥠', tag:'Salgado', desc:'Selecione a quantidade de pacotes. Cada pacote corresponde a 10 unidades.' },
  { id:'enroladinho', name:'Enroladinho', icon:'🥐', tag:'Salgado', desc:'Selecione a quantidade de pacotes. Cada pacote corresponde a 10 unidades.' },
  { id:'outros', name:'Outros salgados', icon:'✦', tag:'Sob consulta', desc:'Use este item para pedir outras opções e detalhe o que deseja nas observações.' }
];

const WHATSAPP='5531984288362';
const grid=document.getElementById('catalogGrid');
const search=document.getElementById('searchInput');
const drawer=document.getElementById('bagDrawer');
const bagItems=document.getElementById('bagItems');
const bagCount=document.getElementById('bagCount');
const bagItemsCount=document.getElementById('bagItemsCount');
let bag=JSON.parse(localStorage.getItem('antonellaSalgadosBag')||'{}');

function saveBag(){localStorage.setItem('antonellaSalgadosBag',JSON.stringify(bag));renderBag();}

function renderCatalog(filter=''){
  const term=filter.trim().toLowerCase();
  const items=catalog.filter(p=>(p.name+' '+p.tag).toLowerCase().includes(term));
  grid.innerHTML=items.map(p=>`
    <article class="product-card">
      <div class="product-top"><span class="product-icon">${p.icon}</span><span class="product-badge">${p.tag}</span></div>
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <footer><span>Valor e disponibilidade a confirmar</span><button class="add-product" data-add="${p.id}" type="button">Adicionar</button></footer>
    </article>`).join('');
  document.getElementById('emptyState').hidden=items.length>0;
}

function renderBag(){
  const entries=Object.entries(bag).filter(([,qty])=>qty>0);
  const totalPackages=entries.reduce((sum,[,qty])=>sum+qty,0);
  bagCount.textContent=totalPackages;
  bagItemsCount.textContent=`${totalPackages} pacote(s) • ${totalPackages*10} unidade(s)`;
  if(!entries.length){bagItems.innerHTML='<div class="bag-empty">Sua sacola está vazia. Adicione os salgados do catálogo.</div>';return;}
  bagItems.innerHTML=entries.map(([id,qty])=>{
    const p=catalog.find(x=>x.id===id);
    return `<div class="bag-item"><div><h4>${p.name}</h4><small>${qty} pacote(s) • ${qty*10} unidade(s)</small></div><div class="qty-controls"><button type="button" data-dec="${id}">−</button><strong>${qty}</strong><button type="button" data-inc="${id}">+</button></div></div>`;
  }).join('');
}

function openBag(){drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
function closeBag(){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.style.overflow='';}
function toast(message){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t);}t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800);}

grid.addEventListener('click',e=>{
  const btn=e.target.closest('[data-add]');
  if(!btn)return;
  const id=btn.dataset.add;
  bag[id]=(bag[id]||0)+1;
  saveBag();
  toast('Adicionado à sacola');
});
bagItems.addEventListener('click',e=>{
  const inc=e.target.closest('[data-inc]');
  const dec=e.target.closest('[data-dec]');
  if(inc){bag[inc.dataset.inc]=(bag[inc.dataset.inc]||0)+1;saveBag();}
  if(dec){const id=dec.dataset.dec;bag[id]=Math.max(0,(bag[id]||0)-1);if(!bag[id])delete bag[id];saveBag();}
});

search.addEventListener('input',()=>renderCatalog(search.value));
document.getElementById('openBag').addEventListener('click',openBag);
document.getElementById('heroBag').addEventListener('click',openBag);
document.getElementById('closeBag').addEventListener('click',closeBag);
document.getElementById('bagBackdrop').addEventListener('click',closeBag);
document.getElementById('continueShopping').addEventListener('click',closeBag);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeBag();});
document.getElementById('clearBag').addEventListener('click',()=>{bag={};saveBag();});

document.getElementById('repeatLast').addEventListener('click',()=>{
  const last=JSON.parse(localStorage.getItem('antonellaLastOrder')||'null');
  if(!last){toast('Nenhuma encomenda anterior salva');return;}
  bag=last.bag||{};
  Object.entries(last.form||{}).forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.value=value||'';});
  saveBag();
  toast('Última encomenda carregada');
});

document.getElementById('orderForm').addEventListener('submit',e=>{
  e.preventDefault();
  const entries=Object.entries(bag).filter(([,q])=>q>0);
  if(!entries.length){toast('Adicione ao menos um item');return;}

  const form={
    customerName:document.getElementById('customerName').value.trim(),
    customerPhone:document.getElementById('customerPhone').value.trim(),
    orderDate:document.getElementById('orderDate').value,
    orderTime:document.getElementById('orderTime').value,
    orderType:document.getElementById('orderType').value,
    orderAddress:document.getElementById('orderAddress').value.trim(),
    paymentMethod:document.getElementById('paymentMethod').value,
    orderNotes:document.getElementById('orderNotes').value.trim()
  };

  if(!form.customerName||!form.customerPhone||!form.orderDate||!form.orderTime||!form.orderType){toast('Preencha os campos obrigatórios');return;}

  const itemLines=entries.map(([id,qty])=>{
    const p=catalog.find(x=>x.id===id);
    return `• ${p.name}: ${qty} pacote(s) (${qty*10} un.)`;
  }).join('\n');
  const dateParts=form.orderDate.split('-');
  const dateBr=dateParts.length===3?`${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`:form.orderDate;
  const msg=`Olá, Antonella! Quero fazer uma encomenda de salgados.\n\n*ITENS*\n${itemLines}\n\n*DADOS DO PEDIDO*\nNome: ${form.customerName}\nTelefone: ${form.customerPhone}\nData: ${dateBr}\nHorário: ${form.orderTime}\nTipo: ${form.orderType}\nBairro/endereço: ${form.orderAddress||'A informar'}\nPagamento: ${form.paymentMethod||'A combinar'}\nObservações: ${form.orderNotes||'Sem observações'}\n\nPor favor, confirme disponibilidade, valores e prazo. Obrigado!`;

  localStorage.setItem('antonellaLastOrder',JSON.stringify({bag,form}));
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,'_blank','noopener');
});

const today=new Date();today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
document.getElementById('orderDate').min=today.toISOString().split('T')[0];

renderCatalog();
renderBag();
