document.documentElement.classList.add('js');
(function(){
  var bar=document.querySelector('.bar');
  if(bar){var f=function(){bar.classList.toggle('solid',window.scrollY>40)};f();addEventListener('scroll',f,{passive:true});}
  var els=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    els.forEach(function(el,i){el.style.setProperty('--i',i%4);io.observe(el)});
  }else els.forEach(function(el){el.classList.add('in')});

  /* menu tabs: Women / Men */
  var tabs=document.querySelectorAll('.tabs a');
  if(tabs.length){
    var show=function(){
      var id=(location.hash||'#women').slice(1); if(id!=='men')id='women';
      document.querySelectorAll('.menu-panel').forEach(function(p){p.hidden=p.id!==id});
      tabs.forEach(function(t){t.setAttribute('aria-current',t.getAttribute('href')==='#'+id)});
    };
    addEventListener('hashchange',show);show();
  }

  /* booking: builds a WhatsApp message from the visitor's choices */
  var form=document.getElementById('book-form');
  if(form){
    var data=JSON.parse(document.getElementById('menu-json').textContent);
    var sel=form.querySelector('select'),btns=form.querySelectorAll('[data-for]'),link=form.querySelector('.send'),name=form.querySelector('input');
    var who='women';
    var fill=function(){sel.innerHTML='<option value="">Choose a service</option>'+data[who].map(function(s){return '<option>'+s+'</option>'}).join('')};
    var upd=function(){
      var m='Hello Shaamy Lounge, I would like to book'+(sel.value?' '+sel.value:' an appointment')+' ('+(who==='women'?"women's":"men's")+' menu).'+(name.value?' Name: '+name.value+'.':'')+' Please share available times.';
      link.href='https://wa.me/919538316195?text='+encodeURIComponent(m);
    };
    btns.forEach(function(b){b.addEventListener('click',function(){who=b.dataset.for;btns.forEach(function(x){x.setAttribute('aria-pressed',x===b)});fill();upd()})});
    sel.addEventListener('change',upd);name.addEventListener('input',upd);fill();upd();
  }
})();
