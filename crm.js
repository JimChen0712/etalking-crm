(function(){
/* ══ 安全防線：只允許在 etalking 網域執行 ══ */
const host=window.location.hostname;
if(!['www.etalkingonline.com','admin.etalkingonline.com'].includes(host)){
    alert('❌ 此工具僅限在 etalking 後台使用\n\n請先登入後台再點擊書籤！');
    return;
}

const path=window.location.pathname;

if(host==='www.etalkingonline.com'&&!path.includes('request_develop')){
    alert('⚠️ 通道已失效！\n\n① 點確定返回後台\n② 進入名單管理頁面\n③ 點開任一張單的「編輯」\n④ 再點一次書籤.');
    window.location.href='https://admin.etalkingonline.com/etalking2.0/#/request_list';
    return;
}

if(host==='admin.etalkingonline.com'){
    if(confirm('需要切換至專屬通道\n\n點確定後跳轉，再點一次書籤即可載入！\n\n💡 若跳轉失敗，請先點開任一張單的「編輯」再試。')){
        const uid=localStorage.getItem('uid')||'';
        const tUrl='https://www.etalkingonline.com/admin/request_develop?member_id=232821&hide_layout=true'+(uid?'&crm_uid='+uid:'');
        const f=document.createElement('iframe');f.style.display='none';f.src=tUrl;
        document.body.appendChild(f);
        setTimeout(()=>{f.remove();window.location.href=tUrl;},2000);
    }
    return;
}

const urlParams=new URLSearchParams(window.location.search);
const crmUid=urlParams.get('crm_uid')||'';
if(!crmUid){alert('❌ 無法識別身份！\n\n請從 etalking 後台點擊書籤來啟動工具。');return;}

/* ══ 設定 ══ */
const MANAGER_UID='424';
const APPS_SCRIPT_URL='https://script.google.com/macros/s/AKfycbxSPDlyiL8Mvx77Jcj0nUuiqjmhWuC9GS4_ZLbpfwGwaMRjL2vfdVvlYFpVmww076elMw/exec';

const INTERVIEW_TEMPLATE = `【英文名字】
【體驗時間】
【年齡職業】
【學習動機】
【希望加強能力】
【學習經驗】
【英文程度】
【痛點】
【近期有打算學習嗎】
【未開始原因】
【10-15分鐘基本的對話】
【希望學習頻率】
【設備/系統版本】
【其他備註】`;

const USER_DICT = {
    '69': 'TEST test0504',
    '162': 'Joy 洪淑慧',
    '240': 'Minzing 程銘靜',
    '60': 'johnny 謝愷澤',
    '424': 'Jim 陳昕謨',
    '279': 'test3 test3',
    '452': 'Rita 侯宛余',
    '433': 'Wynn 吳昱瑩',
    '464': 'ori 孫逸亭',
    '443': 'Hele 徐睿彣',
    '463': 'Sumika 李玉善',
    '455': 'Hazel 林孜瑩',
    '449': 'Evan 林逸華',
    '432': 'Elsie 林采庭',
    '445': 'Luke 楊博竣',
    '457': 'Alan 楊碩頫',
    '438': 'Lily 楊若莉',
    '451': 'Kyle 江宗翰',
    '454': 'Andy 沈祐頡',
    '462': 'homer 許瀚方',
    '461': 'hanfang 許瀚方',
    '456': 'Tony 謝廷翊',
    '458': 'Josie 陳品妤',
    '431': 'Elijah 陳家寬',
    '459': 'An 陳怡安',
    '450': 'Val 陳芊螢',
    '409': 'Joyce 魏良伃',
    '453': 'Wolf 黃詳淵',
    '368': 'Jordan 李睿峰',
    '130': 'Jeremy testjeremy',
    '283': 'Ash 俞任鴻',
    '465': 'Lily 李昱萱',
    '248': 'Luka 林冠宇',
    '434': 'Nina 林怡欣',
    '358': 'amiee 林琬倩',
    '410': 'Claire 葉芷羽',
    '241': 'Paris 黃雅琪',
    '180': 'Rooney 邱于峰'
};

const isManager=crmUid===MANAGER_UID;
const fetchUrl='https://server.etalkingonline.com/name_list/new_list/'+(isManager?'-1':crmUid);

/* ══ Apps Script API ══ */
async function gasGet(params){
    const url=APPS_SCRIPT_URL+'?'+new URLSearchParams(params).toString();
    const res=await fetch(url);
    return res.json();
}
async function gasPost(data){
    const res=await fetch(APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(data)});
    return res.json();
}
async function initSheet(){ await gasGet({action:'init'}); }
async function readSheet(){ return gasGet({action:'read'}); }
async function appendRow(values){ return gasPost({action:'append',values}); }
async function updateRow(rowNum,values){ return gasPost({action:'update',rowNum,values}); }
async function deleteRow(rowNum){ return gasPost({action:'delete',rowNum}); }

let sheetData={}, sheetRowMap={};
let allData=[], detailData={}, currentItem=null, currentMemoItem=null, selectedGrade='';

/* ══ 防抖儲存佇列 ══ */
const saveTimers = {};
const saveStatus = {};

function setSaveStatus(memberId, status) {
    saveStatus[memberId] = status;
    const el = document.getElementById('save-status-'+memberId);
    if(!el) return;
    if(status === 'pending') { el.textContent = '⏳ 待儲存'; el.style.color = '#e67e22'; }
    else if(status === 'saving') { el.textContent = '🔄 儲存中...'; el.style.color = '#3498db'; }
    else if(status === 'saved') { el.textContent = '✅ 已儲存'; el.style.color = '#27ae60'; setTimeout(()=>{ const e=document.getElementById('save-status-'+memberId); if(e)e.textContent=''; }, 2000); }
    else if(status === 'error') { el.textContent = '❌ 失敗'; el.style.color = '#e74c3c'; }
}

function debounceSaveMemo(memberId, grade, memo, item) {
    setSaveStatus(memberId, 'pending');
    if(saveTimers[memberId]) clearTimeout(saveTimers[memberId]);
    saveTimers[memberId] = setTimeout(async () => {
        setSaveStatus(memberId, 'saving');
        try {
            const sd = sheetData[String(memberId)] || {};
            let statusToSave = sd.status || '';
            if(item.type == 1) statusToSave = '新單';
            await updateSheetMemo(memberId, statusToSave, grade, memo, item);
            setSaveStatus(memberId, 'saved');
        } catch(e) {
            setSaveStatus(memberId, 'error');
        }
        delete saveTimers[memberId];
    }, 1500);
}

async function loadSheetData(){
    try{
        await initSheet();
        const data=await readSheet();
        sheetData={};sheetRowMap={};
        if(data.values){
            data.values.forEach((row,idx)=>{
                if(idx===0)return;
                const memberId=row[0];
                if(memberId){
                    sheetData[memberId]={status:row[8]||'',grade:row[9]||'',memo:row[10]||''};
                    sheetRowMap[memberId]=idx+1;
                }
            });
        }
    }catch(e){console.log('Sheet載入失敗:',e);}
}

function getWriterName(){
    return USER_DICT[crmUid]||crmUid;
}

async function syncNewMemberToSheet(item,assignDate){
    const memberId=String(item.member_id);
    if(sheetRowMap[memberId])return;
    const now=new Date();
    const month=now.getFullYear()+'/'+String(now.getMonth()+1).padStart(2,'0');
    const dateStr=assignDate||now.toISOString().split('T')[0];
    const ownerName=(item.user_name&&item.user_name.trim())?item.user_name.trim():getWriterName();
    await appendRow([memberId,item.member_name||'',item.mobile||'',item.source||'無',ownerName,crmUid,dateStr,month,'新單','','',now.toLocaleString('zh-TW')]);
    sheetRowMap[memberId]=Object.keys(sheetRowMap).length+2;
}

async function updateSheetMemo(memberId,status,grade,memo,item){
    const rowNum=sheetRowMap[String(memberId)];
    const now=new Date();
    const timeStr=now.toLocaleString('zh-TW');
    if(!rowNum){
        const month=now.getFullYear()+'/'+String(now.getMonth()+1).padStart(2,'0');
        const dateStr=now.toISOString().split('T')[0];
        const ownerName=(item.user_name&&item.user_name.trim())?item.user_name.trim():getWriterName();
        await appendRow([String(memberId),item.member_name||'',item.mobile||'',item.source||'無',ownerName,crmUid,dateStr,month,status,grade,memo,timeStr]);
        sheetRowMap[String(memberId)]=Object.keys(sheetRowMap).length+2;
    }else{
        await updateRow(rowNum,[status,grade,memo,timeStr]);
    }
    sheetData[String(memberId)]={status,grade,memo};
}

async function sheetsDeleteRow(rowNum){ await deleteRow(rowNum); }

/* ══ Demo 同步 ══ */
async function syncDemoRawData(){
    const statusLabel=document.getElementById('loading-status');
    statusLabel.innerText='🔄 準備同步 Demo 名單...';
    const demoTargets=allData.filter(item=>String(item.type)==='3');
    if(demoTargets.length===0){statusLabel.innerText='✅ 目前沒有 Demo 名單';setTimeout(()=>statusLabel.innerText='',2000);return;}
    for(let i=0;i<demoTargets.length;i+=5){
        const batch=demoTargets.slice(i,i+5);
        statusLabel.innerText='🔄 抓取 Demo 軌跡 '+Math.min(i+5,demoTargets.length)+'/'+demoTargets.length+'...';
        await Promise.all(batch.map(async m=>{
            try{
                const res=await fetch('/admin/request_develop?member_id='+(m.member_id||m.id)+'&hide_layout=true');
                const html=await res.text();
                const doc=new DOMParser().parseFromString(html,'text/html');
                const rows=doc.querySelectorAll('table tbody tr');
                let leadDate='',demoDate='';
                rows.forEach(r=>{
                    const cells=r.querySelectorAll('td');
                    if(cells.length<4)return;
                    const logType=cells[3].innerText.trim();
                    const logContent=cells[4]?cells[4].innerText:'';
                    const dateVal=cells[1].innerText.split(' ')[0];
                    if(logType.includes('名單移動')){
                        if(logContent.includes('移動到新名單')&&!leadDate)leadDate=dateVal;
                        if(logContent.includes('移動到DEMO過名單')&&!demoDate)demoDate=dateVal;
                    }
                });
                m.leadDate=leadDate;m.demoDate=demoDate;
            }catch(e){}
        }));
    }
    statusLabel.innerText='🔄 傳送資料至試算表...';
    const demoList=demoTargets.map(item=>({
        member_id:item.member_id||item.id,member_name:item.member_name,mobile:item.mobile,
        source:item.source,user_name:item.user_name,
        next_time:(item.next_time&&!item.next_time.includes('0000'))?item.next_time.split(' ')[0]:'無紀錄',
        leadDate:item.leadDate||'',demoDate:item.demoDate||''
    }));
    try{
        const res=await gasPost({action:'syncDemoRaw',demoList});
        if(res.success){
            statusLabel.innerText=res.addedCount>0?'✅ 成功新增 '+res.addedCount+' 筆 Demo 資料':'✅ 名單皆已存在，無須新增';
        }
        setTimeout(()=>statusLabel.innerText='',3000);
    }catch(e){statusLabel.innerText='❌ 同步失敗';}
}

/* ══ DOM UI ══ */
['custom-crm-curtain','custom-crm-panel'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove();});
const curtain=document.createElement('div');
curtain.id='custom-crm-curtain';
curtain.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(236,240,241,0.85);backdrop-filter:blur(8px);z-index:999998;pointer-events:all;user-select:none;';
curtain.addEventListener('click',e=>e.stopPropagation());
document.body.style.overflow='hidden';
document.body.appendChild(curtain);

const panel=document.createElement('div');
panel.id='custom-crm-panel';
panel.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:1060px;height:88vh;background:#fff;box-shadow:0 15px 50px rgba(0,0,0,0.2);border-radius:12px;z-index:999999;display:flex;flex-direction:column;overflow:hidden;font-family:sans-serif;';

const header=document.createElement('div');
header.style.cssText='padding:12px 15px;background:#2c3e50;color:white;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;flex-shrink:0;';
header.innerHTML='<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;"><h3 style="margin:0;font-size:15px;color:white;">名單管理面板</h3>'+(isManager?'<select id="consultant-filter" style="padding:4px;border-radius:4px;border:none;max-width:150px;"><option value="-1">所有業務</option></select><button id="sync-all-new-btn" style="padding:4px 10px;cursor:pointer;border-radius:4px;border:none;background:#8e44ad;color:white;font-weight:bold;">同步全體新單</button><button id="sync-demo-btn" style="padding:4px 10px;cursor:pointer;border-radius:4px;border:none;background:#e67e22;color:white;font-weight:bold;">同步Demo</button>':'<span style="font-size:12px;color:#bdc3c7;">我的名單</span>')+'<select id="t-type-filter" style="padding:4px;border-radius:4px;border:none;"><option value="-1">所有種類</option><option value="1">新單</option><option value="2">常態名單</option><option value="3">Demo過名單</option><option value="4">釋出名單</option></select><button id="refresh-btn" style="padding:4px 10px;cursor:pointer;border-radius:4px;border:none;background:#3498db;color:white;">重新整理</button><span id="loading-status" style="font-size:11px;color:#f1c40f;font-weight:bold;"></span></div><button id="close-btn" style="background:transparent;border:none;color:white;font-size:20px;cursor:pointer;">×</button>';

const content=document.createElement('div');
content.style.cssText='flex:1;overflow-y:auto;padding:12px;background:#f8f9fa;';

/* ══ 壓紀錄 Modal ══ */
const recordModal=document.createElement('div');
recordModal.id='record-modal';
recordModal.style.cssText='display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:480px;max-height:85vh;overflow-y:auto;background:white;padding:20px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.2);z-index:1000000;';
recordModal.innerHTML='<h4 style="margin-top:0;">新增聯絡紀錄</h4><input type="hidden" id="modal-member-id"><div id="modal-info-text" style="font-size:11px;color:#e67e22;margin-bottom:10px;font-weight:bold;"></div><div style="margin-bottom:10px;"><label>聯絡類型:</label><select id="modal-status" style="width:100%;padding:5px;margin-top:5px;"><option value="3">未接</option><option value="1">已接聽</option><option value="2">非本人</option><option value="4">關機</option></select></div><div style="margin-bottom:10px;"><label>聯絡內容:</label><textarea id="modal-content" style="width:100%;padding:5px;margin-top:5px;min-height:60px;font-family:sans-serif;font-size:13px;border:1px solid #ddd;border-radius:4px;resize:vertical;">未接 *1</textarea></div><div style="margin-bottom:10px;"><label>下次聯繫日期:</label><input type="date" id="modal-date" style="width:100%;padding:5px;margin-top:5px;"></div><div style="display:flex;justify-content:space-between;margin-top:15px;"><button id="modal-cancel" style="padding:5px 15px;cursor:pointer;">取消</button><button id="modal-submit" style="padding:5px 15px;background:#27ae60;color:white;border:none;cursor:pointer;border-radius:4px;">送出紀錄</button></div>';

panel.appendChild(header);
panel.appendChild(content);
panel.appendChild(recordModal);
document.body.appendChild(panel);

/* ══ 聯絡類型切換：已接聽時填入訪談模板 ══ */
document.getElementById('modal-status').onchange=function(){
    const contentEl=document.getElementById('modal-content');
    if(this.value==='1'){
        contentEl.value=INTERVIEW_TEMPLATE;
        contentEl.style.minHeight='280px';
    }else{
        const m={'2':'非本人 *1','3':'未接 *1','4':'關機 *1'};
        contentEl.value=m[this.value]||'聯絡 *1';
        contentEl.style.minHeight='60px';
    }
};

function updateConsultantDropdown(){
    if(!isManager)return;
    const select=document.getElementById('consultant-filter');
    const names=[...new Set(allData.map(m=>m.user_name?m.user_name.trim():'未指派'))].sort();
    let html='<option value="-1">所有業務</option>';
    names.forEach(n=>{html+='<option value="'+n+'">'+n+'</option>';});
    select.innerHTML=html;select.value='-1';
}

async function fetchData(){
    const statusLabel=document.getElementById('loading-status');
    content.innerHTML='<div style="text-align:center;padding:20px;">資料載入中...</div>';
    statusLabel.innerText='🔄 連接 Google Sheet...';
    await loadSheetData();
    statusLabel.innerText='🔄 載入名單...';
    try{
        const res=await fetch(fetchUrl);
        const data=await res.json();
        allData=data.list||[];
        if(!isManager&&allData.length>0){
            try{
                const resAll=await fetch('https://server.etalkingonline.com/name_list/new_list/-1');
                const dataAll=await resAll.json();
                const allList=dataAll.list||[];
                allList.forEach(m=>{
                    const mId=m.member_id||m.id;
                    const target=allData.find(x=>(x.member_id||x.id)==mId);
                    if(target&&m.source)target.source=m.source;
                });
            }catch(e){}
        }
        updateConsultantDropdown();
        renderList();
        if(!isManager){statusLabel.innerText='🔄 載入新單細節...';await loadDetailsForAll();}
        statusLabel.innerText='✅ 載入完成';
        setTimeout(()=>statusLabel.innerText='',2000);
    }catch(err){
        content.innerHTML='<div style="color:red;text-align:center;">載入失敗: '+err.message+'</div>';
        statusLabel.innerText='❌ 載入失敗';
    }
}

async function loadDetailsForAll(){
    const targets=allData.filter(m=>m.type==1&&!detailData[m.member_id]);
    if(!targets.length)return;
    const statusLabel=document.getElementById('loading-status');
    for(let i=0;i<targets.length;i+=5){
        const batch=targets.slice(i,i+5);
        await Promise.all(batch.map(async m=>{
            try{
                const res=await fetch('/admin/request_develop?member_id='+m.member_id+'&hide_layout=true');
                const html=await res.text();
                const doc=new DOMParser().parseFromString(html,'text/html');
                const rows=doc.querySelectorAll('table tbody tr');
                let assignDate=null,contactCount=0;
                rows.forEach(r=>{
                    const cells=r.querySelectorAll('td');
                    if(cells.length<4)return;
                    const type=cells[3].innerText.trim();
                    if(type.includes('名單移動')&&cells[4]&&cells[4].innerText.includes('移動到新名單'))assignDate=cells[1].innerText.split(' ')[0];
                    if(type.includes('聯絡'))contactCount++;
                });
                detailData[m.member_id]={assignDate,contactCount};
                if(assignDate)await syncNewMemberToSheet(m,assignDate);
            }catch(e){}
        }));
        statusLabel.innerText='🔄 新單細節 '+Math.min(i+5,targets.length)+'/'+targets.length;
        renderList();
    }
}

async function loadDetailsForConsultant(consultantName){
    const targets=allData.filter(m=>m.type==1&&(m.user_name||'').trim()===consultantName&&!detailData[m.member_id]);
    if(!targets.length)return;
    const statusLabel=document.getElementById('loading-status');
    statusLabel.innerText='🔄 同步 '+consultantName+' 的新單...';
    for(let i=0;i<targets.length;i+=5){
        const batch=targets.slice(i,i+5);
        await Promise.all(batch.map(async m=>{
            try{
                const res=await fetch('/admin/request_develop?member_id='+m.member_id+'&hide_layout=true');
                const html=await res.text();
                const doc=new DOMParser().parseFromString(html,'text/html');
                const rows=doc.querySelectorAll('table tbody tr');
                let assignDate=null,contactCount=0;
                rows.forEach(r=>{
                    const cells=r.querySelectorAll('td');
                    if(cells.length<4)return;
                    const type=cells[3].innerText.trim();
                    if(type.includes('名單移動')&&cells[4]&&cells[4].innerText.includes('移動到新名單'))assignDate=cells[1].innerText.split(' ')[0];
                    if(type.includes('聯絡'))contactCount++;
                });
                detailData[m.member_id]={assignDate,contactCount};
                if(assignDate)await syncNewMemberToSheet(m,assignDate);
            }catch(e){}
        }));
        statusLabel.innerText='🔄 '+consultantName+' 新單 '+Math.min(i+5,targets.length)+'/'+targets.length;
        renderList();
    }
    statusLabel.innerText='✅ '+consultantName+' 同步完成';
    setTimeout(()=>statusLabel.innerText='',2000);
}

function getDropDaysLeft(item,detail){
    const today=new Date();today.setHours(0,0,0,0);
    if(item.type==1){
        if(!detail||!detail.assignDate)return null;
        const assign=new Date(detail.assignDate);assign.setHours(0,0,0,0);
        const dropDate=new Date(assign);dropDate.setDate(dropDate.getDate()+3);
        return Math.ceil((dropDate-today)/86400000);
    }else{
        if(!item.next_time||item.next_time.includes('0000-00-00'))return null;
        const nextT=new Date(item.next_time.split(' ')[0]);nextT.setHours(0,0,0,0);
        const dropDate=new Date(nextT);dropDate.setDate(dropDate.getDate()+4);
        return Math.ceil((dropDate-today)/86400000);
    }
}

function renderList(){
    const selectedConsultant=isManager?document.getElementById('consultant-filter').value:'-1';
    const selectedTType=document.getElementById('t-type-filter').value;
    let filteredData=allData.filter(item=>{
        const cMatch=isManager?(selectedConsultant=='-1'||(item.user_name||'').trim()===selectedConsultant):true;
        const tMatch=selectedTType=='-1'||String(item.type)===selectedTType;
        return cMatch&&tMatch;
    });
    filteredData.sort((a,b)=>(getDropDaysLeft(a,detailData[a.member_id])??999)-(getDropDaysLeft(b,detailData[b.member_id])??999));
    if(!filteredData.length){content.innerHTML='<div style="text-align:center;padding:20px;color:#666;">找不到符合條件的名單。</div>';return;}
    const typeStyles={'1':{label:'新單',bg:'#1a6fc4'},'2':{label:'常態',bg:'#27ae60'},'3':{label:'Demo',bg:'#8e44ad'},'4':{label:'釋出',bg:'#e67e22'}};
    const sourceHeader=isManager?'<th style="padding:6px;width:7%;">來源</th>':'';
    let html='<table style="width:100%;border-collapse:collapse;font-size:12px;">';
    html+='<tr style="background:#e9ecef;text-align:left;position:sticky;top:0;z-index:10;"><th style="padding:6px;">姓名/狀態</th><th style="padding:6px;">電話</th><th style="padding:6px;width:10%;">等級</th><th style="padding:6px;width:22%;">備註</th><th style="padding:6px;width:16%;">下次聯繫 & 預警</th>'+sourceHeader+'<th style="padding:6px;">業務</th><th style="padding:6px;width:9%;">操作</th></tr>';

    filteredData.slice(0,150).forEach(item=>{
        const id=item.member_id||item.id||'';
        const d=detailData[id];
        const sd=sheetData[String(id)]||{};
        const dropDays=getDropDaysLeft(item,d);
        const ts=typeStyles[String(item.type)]||{label:'其他',bg:'#95a5a6'};
        const rowBorderColor=dropDays!==null&&dropDays<=0?'#e74c3c':dropDays!==null&&dropDays<=2?'#e67e22':ts.bg;

        let warningHtml='';
        if(dropDays!==null){
            if(dropDays<0)warningHtml='<br><span style="color:#c0392b;font-weight:bold;">🔥 已噴單(過期'+Math.abs(dropDays)+'天)</span>';
            else if(dropDays===0)warningHtml='<br><span style="color:#d35400;font-weight:bold;">🔥 今日噴單</span>';
            else if(dropDays<=2)warningHtml='<br><span style="color:#e67e22;font-weight:bold;">⚠️ 剩 '+dropDays+' 天</span>';
            else warningHtml='<br><span style="color:#16a085;">距噴單 '+dropDays+' 天</span>';
        }else if(item.type==1&&!d){
            warningHtml=isManager&&selectedConsultant=='-1'?'<br><span style="color:#95a5a6;">請選取業務載入</span>':'<br><span style="color:#95a5a6;">載入中...</span>';
        }

        let progressHtml='';
        if(item.type==1){
            const count=d?d.contactCount:0;
            const pct=Math.min(100,(count/6)*100);
            const assignStr=(d&&d.assignDate)?d.assignDate:'待載入';
            progressHtml='<div style="font-size:10px;color:#1a6fc4;margin-top:3px;">進單:'+assignStr+' 進度:'+count+'/6</div><div style="width:100%;height:3px;background:#ddd;border-radius:2px;margin-top:2px;"><div style="width:'+pct+'%;height:100%;background:'+(pct<100?'#3498db':'#27ae60')+';border-radius:2px;"></div></div>';
        }

        const reInquireHtml=sd.status==='再次留單'?'<span style="background:#c0392b;color:white;padding:1px 5px;border-radius:3px;font-size:10px;margin-left:5px;">再次留單</span>':'';
        const btnBg=dropDays!==null&&dropDays<=0?'#e74c3c':ts.bg;
        const sourceCell=isManager?'<td style="padding:6px;color:#8e44ad;font-size:11px;vertical-align:top;">S:'+(item.source||'-')+'</td>':'';
        const displayUserName=(item.user_name&&item.user_name.trim())?item.user_name.trim():getWriterName();

        /* ══ 內嵌 A/C 按鈕 ══ */
        const gradeA = sd.grade==='A';
        const gradeC = sd.grade==='C';
        const gradeHtml =
            '<div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;">' +
            '<button class="grade-inline-btn" data-id="'+id+'" data-val="A" style="padding:2px 10px;border:2px solid '+(gradeA?'#1a6fc4':'#ddd')+';border-radius:4px;cursor:pointer;font-weight:bold;font-size:12px;background:'+(gradeA?'#1a6fc4':'#fff')+';color:'+(gradeA?'white':'#333')+';">A</button>' +
            '<button class="grade-inline-btn" data-id="'+id+'" data-val="C" style="padding:2px 10px;border:2px solid '+(gradeC?'#e67e22':'#ddd')+';border-radius:4px;cursor:pointer;font-weight:bold;font-size:12px;background:'+(gradeC?'#e67e22':'#fff')+';color:'+(gradeC?'white':'#333')+';">C</button>' +
            (sd.grade?'<button class="grade-inline-btn" data-id="'+id+'" data-val="" style="padding:2px 6px;border:1px solid #ddd;border-radius:4px;cursor:pointer;font-size:10px;background:#f5f5f5;color:#999;">✕</button>':'') +
            '</div>';

        /* ══ 內嵌備註輸入框 ══ */
        const memoHtml =
            '<div style="position:relative;">' +
            '<textarea class="memo-inline-input" data-id="'+id+'" rows="2" style="width:100%;padding:4px 6px;border:1px solid #ddd;border-radius:4px;font-size:11px;font-family:sans-serif;resize:none;background:#fafafa;" placeholder="輸入備註...">'+( sd.memo||'' )+'</textarea>' +
            '<span id="save-status-'+id+'" style="font-size:10px;position:absolute;bottom:2px;right:4px;"></span>' +
            '</div>';

        html+='<tr style="border-bottom:1px solid #dee2e6;border-left:4px solid '+rowBorderColor+';"><td style="padding:6px;vertical-align:top;"><b>'+(item.member_name||'未知')+'</b><br><span style="background:'+ts.bg+';color:white;padding:1px 5px;border-radius:3px;font-size:10px;">'+ts.label+'</span>'+reInquireHtml+progressHtml+'</td><td style="padding:6px;vertical-align:top;">'+(item.mobile||'-')+'</td><td style="padding:6px;vertical-align:top;">'+gradeHtml+'</td><td style="padding:6px;vertical-align:top;">'+memoHtml+'</td><td style="padding:6px;vertical-align:top;"><span style="color:#d35400;">'+(item.next_time&&!item.next_time.includes('0000')?item.next_time.split(' ')[0]:'無紀錄')+'</span>'+warningHtml+'</td>'+sourceCell+'<td style="padding:6px;color:#7f8c8d;vertical-align:top;font-size:11px;">'+displayUserName+'</td><td style="padding:6px;vertical-align:top;"><button class="quick-record-btn" data-id="'+id+'" style="padding:4px 8px;background:'+btnBg+';color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:bold;width:100%;">壓紀錄</button></td></tr>';
    });

    html+='</table>';
    if(filteredData.length>150)html+='<div style="text-align:center;padding:10px;color:#888;">(共 '+filteredData.length+' 筆，顯示前 150 筆)</div>';
    content.innerHTML=html;

    /* ══ A/C 按鈕點擊事件 ══ */
    document.querySelectorAll('.grade-inline-btn').forEach(btn=>{
        btn.onclick=async e=>{
            const memberId=e.target.getAttribute('data-id');
            const val=e.target.getAttribute('data-val');
            const item=allData.find(m=>(m.member_id||m.id)==memberId);
            const sd=sheetData[String(memberId)]||{};
            const memo=sd.memo||'';
            // 立即更新本地狀態並重新渲染
            if(!sheetData[String(memberId)])sheetData[String(memberId)]={status:'',grade:'',memo:''};
            sheetData[String(memberId)].grade=val;
            renderList();
            // 儲存到 Sheet
            try{
                let statusToSave=sd.status||'';
                if(item&&item.type==1)statusToSave='新單';
                await updateSheetMemo(memberId,statusToSave,val,memo,item);
            }catch(e){console.log('A/C 儲存失敗',e);}
        };
    });

    /* ══ 備註輸入框防抖儲存 ══ */
    document.querySelectorAll('.memo-inline-input').forEach(input=>{
        input.addEventListener('input', e=>{
            const memberId=e.target.getAttribute('data-id');
            const memo=e.target.value;
            const item=allData.find(m=>(m.member_id||m.id)==memberId);
            const sd=sheetData[String(memberId)]||{};
            const grade=sd.grade||'';
            if(!sheetData[String(memberId)])sheetData[String(memberId)]={status:'',grade:'',memo:''};
            sheetData[String(memberId)].memo=memo;
            debounceSaveMemo(memberId,grade,memo,item);
        });
    });

    /* ══ 壓紀錄按鈕 ══ */
    document.querySelectorAll('.quick-record-btn').forEach(btn=>{
        btn.onclick=e=>{
            const memberId=e.target.getAttribute('data-id');
            const item=allData.find(m=>(m.member_id||m.id)==memberId);
            currentItem=item;
            document.getElementById('modal-member-id').value=memberId;
            const formatDate=(date)=>{
                const y=date.getFullYear();
                const mo=String(date.getMonth()+1).padStart(2,'0');
                const d=String(date.getDate()).padStart(2,'0');
                return y+'-'+mo+'-'+d;
            };
            const today=new Date();
            const nextTarget=new Date(today);
            nextTarget.setDate(today.getDate()+(item.type==1?1:3));
            const dateInput=document.getElementById('modal-date');
            dateInput.value=formatDate(nextTarget);
            const maxDate=new Date(today);
            maxDate.setDate(today.getDate()+14);
            dateInput.min=formatDate(today);
            dateInput.max=formatDate(maxDate);
            const d=detailData[memberId];
            document.getElementById('modal-info-text').innerText=item.type==1&&d?'【新單】已壓 '+d.contactCount+' 次，目標 6 次，還需 '+Math.max(0,6-d.contactCount)+' 次':'';
            // 重置狀態
            const statusSel=document.getElementById('modal-status');
            statusSel.value='3';
            const contentEl=document.getElementById('modal-content');
            contentEl.value='未接 *1';
            contentEl.style.minHeight='60px';
            recordModal.style.display='block';
        };
    });
}

/* ══ 壓紀錄送出 ══ */
document.getElementById('modal-submit').onclick=()=>{
    if(!currentItem)return;
    const memberId=document.getElementById('modal-member-id').value;
    const btn=document.getElementById('modal-submit');btn.innerText='送出中...';
    let iframe=document.getElementById('hidden-save-frame')||document.createElement('iframe');
    iframe.name='hidden-save-frame';iframe.id='hidden-save-frame';iframe.style.display='none';iframe.sandbox='allow-forms allow-same-origin';
    document.body.appendChild(iframe);
    const form=document.createElement('form');form.target='hidden-save-frame';form.method='POST';
    form.action='https://www.etalkingonline.com/admin/request_develop/save';
    const params={'current_member_id':memberId,'contact_status':document.getElementById('modal-status').value,'content':document.getElementById('modal-content').value,'sub_content':'','search_begin':document.getElementById('modal-date').value,'time':'12:00:00','consultant_type':'10','type':'20'};
    for(let k in params){let i=document.createElement('input');i.type='hidden';i.name=k;i.value=params[k];form.appendChild(i);}
    document.body.appendChild(form);form.submit();
    setTimeout(()=>{
        alert('✅ 紀錄已成功送出！');
        recordModal.style.display='none';btn.innerText='送出紀錄';
        if(currentItem.type==1&&detailData[memberId])detailData[memberId].contactCount++;
        currentItem.next_time=params['search_begin']+' 11:59:59';
        renderList();
    },1000);
};

document.getElementById('close-btn').onclick=()=>{
    panel.remove();curtain.remove();document.body.style.overflow='';
    setTimeout(()=>{window.location.href='https://admin.etalkingonline.com/etalking2.0/#/kpi';},300);
};
document.getElementById('refresh-btn').onclick=fetchData;
document.getElementById('t-type-filter').onchange=renderList;
document.getElementById('modal-cancel').onclick=()=>recordModal.style.display='none';

if(isManager){
    document.getElementById('consultant-filter').onchange=function(){
        renderList();
        if(this.value!=='-1')loadDetailsForConsultant(this.value);
    };
    const syncNewBtn=document.getElementById('sync-all-new-btn');
    if(syncNewBtn){
        syncNewBtn.onclick=async()=>{
            const statusLabel=document.getElementById('loading-status');
            syncNewBtn.disabled=true;syncNewBtn.style.background='#95a5a6';syncNewBtn.innerText='同步中...';
            await loadDetailsForAll();
            syncNewBtn.disabled=false;syncNewBtn.style.background='#8e44ad';syncNewBtn.innerText='同步全體新單';
            statusLabel.innerText='✅ 新單同步完成';
            setTimeout(()=>statusLabel.innerText='',3000);
            renderList();
        };
    }
    const syncDemoBtn=document.getElementById('sync-demo-btn');
    if(syncDemoBtn){
        syncDemoBtn.onclick=async()=>{
            syncDemoBtn.disabled=true;syncDemoBtn.style.background='#95a5a6';syncDemoBtn.innerText='同步中...';
            await syncDemoRawData();
            syncDemoBtn.disabled=false;syncDemoBtn.style.background='#e67e22';syncDemoBtn.innerText='同步Demo';
            renderList();
        };
    }
}
fetchData();
})();
