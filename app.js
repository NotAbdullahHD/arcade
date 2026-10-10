(function(){
var HID=window.HIDDEN||[];
var G=(window.GAMES||[]).filter(function(g){return HID.indexOf(g.id)<0});
var URLBASE='https://cdn.jsdelivr.net/gh/gn-math/html@main/';
function $(s,r){return (r||document).querySelector(s)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function get(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v||d}catch(e){return d}}
function put(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function bySlug(s){for(var i=0;i<G.length;i++)if(G[i].slug===s)return G[i]}
var fav=get('gm_fav',[]);
var HOT=G.slice(0,10).map(function(g){return g.slug});
function tile(g){
  var on=fav.indexOf(g.slug)>-1;
  return '<a class="tile" href="game.html?g='+g.slug+'"><img loading="lazy" src="img/covers/'+g.id+'.webp" alt="'+esc(g.name)+'">'+
   (HOT.indexOf(g.slug)>-1?'<span class="badge">HOT</span>':'')+
   '<button class="heart'+(on?' on':'')+'" data-fav="'+g.slug+'" aria-label="Favorite">&#9829;</button>'+
   '<b>'+esc(g.name)+'</b><small>'+g.cat+'</small></a>';
}
function updFavCount(){var e=$('#favcount');if(e)e.textContent=fav.length||''}
document.addEventListener('click',function(e){
  var h=e.target.closest&&e.target.closest('[data-fav]');
  if(h){e.preventDefault();e.stopPropagation();var s=h.getAttribute('data-fav'),i=fav.indexOf(s);
    if(i>-1)fav.splice(i,1);else fav.push(s);put('gm_fav',fav);updFavCount();
    [].forEach.call(document.querySelectorAll('[data-fav="'+s+'"]'),function(x){x.classList.toggle('on',fav.indexOf(s)>-1)});
    var fb=$('#favbtn');if(fb&&fb.getAttribute('data-fav')===s)setFavBtn(s);
  }
});
updFavCount();
[].forEach.call(document.querySelectorAll('#side a[href*="c="]'),function(l){var c=l.getAttribute('href').split('c=')[1];var n=G.filter(function(g){return g.cat===c}).length;var e=l.querySelector('.cnt');if(e)e.textContent=n});
// theme + menu
var tb=$('#theme');if(tb)tb.onclick=function(){
  var cur=document.documentElement.getAttribute('data-theme');
  if(!cur)cur=(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';
  var n=cur==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);try{localStorage.setItem('gm_theme',n)}catch(e){}
};
var mb=$('#menu');if(mb)mb.onclick=function(){document.body.classList.toggle('nav-open')};
var sd=$('#shade');if(sd)sd.onclick=function(){document.body.classList.remove('nav-open')};
// search
var q=$('#q'),sug=$('#sug');
if(q){
  var url=new URLSearchParams(location.search);if(url.get('q'))q.value=url.get('q');
  q.addEventListener('input',function(){
    var v=q.value.trim().toLowerCase();
    if(!v){sug.style.display='none';return}
    var m=G.filter(function(g){return g.name.toLowerCase().indexOf(v)>-1}).slice(0,6);
    sug.innerHTML=m.map(function(g){return '<li><a href="game.html?g='+g.slug+'"><img src="img/covers/'+g.id+'.webp" alt=""><span>'+esc(g.name)+'</span></a></li>'}).join('')||'<li class="empty" style="padding:6px 10px">No games found</li>';
    sug.style.display='block';
  });
  q.addEventListener('keydown',function(e){if(e.key==='Enter'&&q.value.trim())location.href='browse.html?q='+encodeURIComponent(q.value.trim())});
  document.addEventListener('click',function(e){if(!e.target.closest('.search'))sug.style.display='none'});
}
function recent(){return get('gm_recent',[]).map(bySlug).filter(Boolean)}
function favs(){return fav.map(bySlug).filter(Boolean)}
function cats(){var c=[];G.forEach(function(g){if(c.indexOf(g.cat)<0)c.push(g.cat)});return c.sort()}
function row(title,list,link){
  if(!list.length)return '';
  return '<div class="rowhead"><h2>'+title+'</h2>'+(link?'<a href="'+link+'">See all &rarr;</a>':'')+'</div><div class="rowgrid">'+list.map(tile).join('')+'</div>';
}
// ---------- home
var mosaic=$('#mosaic');
if(mosaic){
  mosaic.innerHTML=G.slice(0,9).map(tile).join('');
  var h='';
  var rec=recent();h+=row('Continue playing',rec.slice(0,6),'browse.html?list=recent');
  h+=row('Trending',G.slice(9,15),'browse.html?list=popular');
  h+=row('Recently added',G.slice().sort(function(a,b){return b.id-a.id}).slice(0,6),'browse.html?list=new');
  cats().forEach(function(c){
    var l=G.filter(function(g){return g.cat===c});
    if(l.length>=6)h+=row(c+' games',l.slice(0,6),'browse.html?c='+c);
  });
  $('#rows').innerHTML=h;
}
// ---------- browse
var grid=$('#grid');
if(grid&&$('#btitle')){
  var P=new URLSearchParams(location.search),list=P.get('list'),cat=P.get('c'),qq=(P.get('q')||'').toLowerCase();
  var sort=$('#sort');
  var titles={popular:'Popular games',new:'Recently added',recent:'Recently played',favorites:'Your favorites'};
  var base=G.slice();
  if(list==='recent')base=recent();else if(list==='favorites')base=favs();
  if(list==='new')sort.value='new';
  function drawB(){
    var l=base.filter(function(g){return (!cat||g.cat===cat)&&(!qq||g.name.toLowerCase().indexOf(qq)>-1)});
    if(sort.value==='az')l.sort(function(a,b){return a.name.localeCompare(b.name)});
    else if(sort.value==='new')l.sort(function(a,b){return b.id-a.id});
    else if(list!=='recent'&&list!=='favorites')l.sort(function(a,b){return G.indexOf(a)-G.indexOf(b)});
    $('#bcount').textContent=l.length+' games';
    var msg=list==='favorites'?'No favorites yet. Tap the heart on any game to save it here.':list==='recent'?'Nothing played yet.':'Nothing matches that. Try a different word.';
    grid.innerHTML=l.length?l.map(tile).join(''):'<p class="empty">'+msg+'</p>';
  }
  var t=cat?cat+' games':qq?'Results for "'+P.get('q')+'"':(titles[list]||'All games');
  $('#btitle').textContent=t;document.title=t+' - GhostMath';
  var ch=['<a class="chip'+(!cat?' on':'')+'" href="browse.html'+(list?'?list='+list:'')+'">All</a>'];
  cats().forEach(function(c){ch.push('<a class="chip'+(c===cat?' on':'')+'" href="browse.html?c='+c+'">'+c+'</a>')});
  $('#chips').innerHTML=ch.join('');
  sort.onchange=drawB;drawB();
}
// ---------- game
var player=$('#player');
if(player&&$('#gname')){
  var slug=new URLSearchParams(location.search).get('g'),g=bySlug(slug);
  if(!g){$('#gwrap').innerHTML='<p class="empty">Game not found. <a href="browse.html" style="text-decoration:underline">Browse all games</a></p>'}
  else{
    document.title=g.name+' - play free online | GhostMath';
    var md=document.querySelector('meta[name=description]');if(md)md.content='Play '+g.name+' free in your browser on GhostMath. No download, no sign up.';
    $('#gname').textContent=g.name;
    $('#crumbs').innerHTML='<a href="index.html">Home</a> &rsaquo; <a href="browse.html?c='+g.cat+'">'+g.cat+'</a> &rsaquo; '+esc(g.name);
    var fb=$('#favbtn');fb.setAttribute('data-fav',g.slug);
    window.setFavBtn=function(s){var on=fav.indexOf(s)>-1;fb.classList.toggle('on',on);fb.innerHTML=(on?'&#9829; Saved':'&#9825; Favorite')};
    setFavBtn(g.slug);
    var by=g.by?(g.link?'<a href="'+esc(g.link)+'" target="_blank" rel="noopener nofollow">'+esc(g.by)+'</a>':esc(g.by)):'Unknown';
    $('#about').innerHTML='<h3>About '+esc(g.name)+'</h3><p>Play '+esc(g.name)+' free in your browser. It is a '+g.cat.toLowerCase()+' game, and it runs right here with nothing to download.</p><dl><dt>Category</dt><dd><a href="browse.html?c='+g.cat+'">'+g.cat+'</a></dd><dt>Made by</dt><dd>'+by+'</dd><dt>Controls</dt><dd>Usually arrow keys or WASD, or mouse and touch. Check the in-game instructions.</dd></dl>';
    // The games' HTML is fetched as text and written into the frame (CDNs serve .html as plain text).
    // Several mirrors are tried in order, so one blocked host does not break everything.
    var MIRRORS=['https://cdn.jsdelivr.net/gh/gn-math/html@main/','https://fastly.jsdelivr.net/gh/gn-math/html@main/','https://gcore.jsdelivr.net/gh/gn-math/html@main/','https://raw.githubusercontent.com/gn-math/html/main/'];
    var cached=null,lastErr='',mode=g.page?'own':'gn';
    function host(u){return u.split('/')[2]}
    function tryMirror(i,errs){
      if(i>=MIRRORS.length)return Promise.reject(errs.join(' | '));
      return fetch(MIRRORS[i]+g.file).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text()}).then(function(t){
        if(t.indexOf('<')<0)throw new Error('not html');return t;
      }).catch(function(e){errs.push(host(MIRRORS[i])+': '+(e&&e.message||e));return tryMirror(i+1,errs)});
    }
    function getHtml(){
      if(cached)return Promise.resolve(cached);
      return tryMirror(0,[]).then(function(h){
        h=h.replace(/<script[^>]*googletagmanager[^>]*><\/script>/gi,'');
        cached=h;return h;
      });
    }
    function fail(msg){
      player.innerHTML='<p class="loading">This game would not load right now.<br>Try Reload, or pick another one.'+(msg?'<br><small style="opacity:.6">'+esc(String(msg))+'</small>':'')+'</p>';
    }
    function load(){
      player.innerHTML='<p class="loading">Loading game...</p>';
      var s=get('gm_recent',[]).filter(function(x){return x!==g.slug});s.unshift(g.slug);put('gm_recent',s.slice(0,12));
      if(mode==='own'){
        player.innerHTML='<iframe id="frame" src="'+g.page+'" allow="autoplay; fullscreen; gamepad; clipboard-write" allowfullscreen title="'+esc(g.name)+'"></iframe>';
        return;
      }
      getHtml().then(function(html){
        try{
          player.innerHTML='<iframe id="frame" allow="autoplay; fullscreen; gamepad; clipboard-write" allowfullscreen title="'+esc(g.name)+'"></iframe>';
          var d=$('#frame').contentDocument;d.open();d.write(html);d.close();
        }catch(err){fail('write failed: '+err)}
      }).catch(function(err){fail(err)});
    }
    if(g.page){
      var alt=document.createElement('button');alt.className='btn';alt.textContent='Try other version';
      alt.onclick=function(){mode=mode==='own'?'gn':'own';load()};
      $('.gbtns').appendChild(alt);
    }
    cover();
    $('#fs').onclick=function(){var f=$('#frame')||player;(f.requestFullscreen||f.webkitRequestFullscreen||function(){}).call(f)};
    $('#rl').onclick=load;
    $('#nt').onclick=function(){if(mode==='own'){window.open(g.page,'_blank');return}getHtml().then(function(html){var w=window.open('about:blank','_blank');if(w){w.document.open();w.document.write(html);w.document.close()}})};
    $('#sh').onclick=function(){
      var u=location.href;
      if(navigator.share){navigator.share({title:g.name,url:u}).catch(function(){})}
      else if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){$('#sh').textContent='Link copied'})}
    };
    var sim=G.filter(function(x){return x.cat===g.cat&&x.slug!==g.slug});
    $('#sim').innerHTML=sim.slice(0,8).map(tile).join('');
    var other=G.filter(function(x){return x.cat!==g.cat&&x.slug!==g.slug}).slice(0,12);
    $('#more').innerHTML=sim.slice(8,14).concat(other).slice(0,12).map(tile).join('');
  }
}
})();
