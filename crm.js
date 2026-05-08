(function(){
/* ══ 安全防線：只允許在 etalking 網域執行 ══ */
const host=window.location.hostname;
if(!['www.etalkingonline.com','admin.etalkingonline.com'].includes(host)){
    alert('❌ 此工具僅限在 etalking 後台使用\n\n請先登入後台再點擊書籤！');
    return;
}

const path=window.location.pathname;

if(host==='www.etalkingonline.com'&&!path.includes('request_develop')){
    alert('⚠️ 通道已失效！\n\n① 點確定返回後台\n② 進入名單管理頁面\n③ 點開任一張單的「編輯」\n④ 再點一次書籤');
    window.location.href='https://admin.etalkingonline.com/etalking2.0/#/request_list';
    return;
}

if(host==='admin.etalkingonline.com'){
    if(confirm('🚀 需要切換至專屬通道\n\n點確定後跳轉，再點一次書籤即可載入！\n\n💡 若跳轉失敗，請先點開任一張單的「編輯」再試。')){
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
const SHEET_ID='1HXo-O7CbwftLDjBe0csbyYPalPckmqYfhMeVqU-FJWk';
const SERVICE_ACCOUNT_EMAIL='etalking-crm@etalking-crm.iam.gserviceaccount.com';

/* 🔥 專屬 VIP 對照表：確保名字 100% 正確 */
const USER_DICT = {
   // === 業務部 (主管) ===
    '69': 'TEST test0504',
    '162': 'Joy 洪淑慧',
    '240': 'Minzing 程銘靜',
    '60': 'johnny 謝愷澤',
    '424': 'Jim 陳昕謨',

    // === 業務部 ===
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

    // === IT & CS ===
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

const PRIVATE_KEY='----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDHdUqOnFfehSoL\nyDlD2rOeNlS5+Aaj01qWJG7BRshHyGPlWmGidriye3tpUfVox82faNM4Rruh1d7M\nK4rygJphAwUB/Q9fCnNS0tmeLxevRT6QtqlFvpiGZyIrrBWWJ5sXkNbZx/5PDd+D\n82233tZeWv2Ep88fcVjspkE/q93j1pieswPkkVSrwMvXZ0bvHdG9oIf2S+O/Tqxy\nglsUU6aiW7VvMXuXo1axyiSXRJf/R9q++51mA0r43GKrP/o8VJtYuazb82wuZ1NZ\n/mwTwrBPx7rNOlT7hPjiCvpc9WebfVuHitEtI/D8zXvNSH8+ekQXLGDzQEVTRJmq\nowHBMQ03AgMBAAECggEAXWWu49iRzMDOT3YSWpOuSAdo5Swe79eoM2Yb9qUOY46S\nOHN6BHlTQ0BPKaIXKFlnD54mSdPVSJK9IR3CkotlvseLMMMuz3I1TjMtc8TZclka\nUuk1mlMFWOoyNgD+mrExDnfkI1Zi3uHAKCl01wShnM0+qT9q3W5WFXpEU2xHGsgt\n+2L3nndOnuhiWvcoyxamgxrvm23Qw/36SEOfxyr+6kMJFT+W/v1gxEeZjTn2sKyj\nLq6LIuAVh2YBauluboNvVSMimUq8gaMOCPh3vhG6UVigkkODclOk52DcpnBAhHlP\nm/eynpHvZ4s0dr21AMEOnRMXkeqK0HzWSAmoIXnAAQKBgQDu6PSa/ZNQGK67yHeA\n/csg2AfXxEeH1bf/diP0OZXkLP8g1JGKTl5x0WWY8Fcssn7JEwiw+qea6o/A9t1A\nJzwYtsJQ/bHW1jsVbwGMtm2rKL9D3NePjDhoOBa3w5PoHvCuXGJ+ryp+GadWa8F8\nxbLphV5+YpKcsJcDdZRG46eUNwKBgQDVud+ei9bvTPBqyqciBRThRBUyAsoQN/KE\n5Fx3UKQVCLLowYa/YR/Kb2fEVmoMtnfAjzzrNM7N5CjJmu92WHvU6eMj1u/7v3vt\nd50IjZHycNGXalhyO5YMTQJf5vRCc0IIBOxnqXLKxDp3lW4V+LppiLbBbBbcuyxU\nOzKh8lfPAQKBgQCYJiHJJx6PDvkQvC1nJ7oaU5pDDkxjtHb2qT1iht3vr7xXIykB\nBMHfCHUEfmN2IsLduVJ6q1bcMO+V+2GSPqpmLtX3kGmWoV6FWumIvJGBRHTyeg2J\n7MnrjXTiWRqz5ChxUoKjnViZcCsCvaM+nAVB9N7l7E7knQ2/dT0WHFuX5wKBgQCh\nbiSun1c4JrgNIYZ91rK/t2n+/UZcW7XNlKMW6A0XahugXNSHZzfY8q7BCLhPY98t\nzcMosRlnQGdiZ6lpjUnzNrn+zxEy6J4VblxpIm1TXs2gfY3SspkSL3SUtWBXdLEy\nV22smrt+1hqHSpH8/ILoxX+stxTJooLIGHKVCfQzAQKBgQDF8xf71MUEOHY8Ae36\nit/fL4uWgK2q3zo/qiVGoxSCJ7bMeYZv7uwku/gMNx/WJTaxqln/oZ3qBem963BP\nRHTy8rycz/inwJu+O45jUYLx1IGHfTNO4BPljU/9/Pkwg/ES2AQJpDi28lACtBc/\nQin4ZveqmqVobS7Z8JdGML5d/Q==\n-----END PRIVATE KEY-----\n';
const isManager=crmUid===MANAGER_UID;
const fetchUrl='https://server.etalkingonline.com/name_list/new_list/'+(isManager?'-1':crmUid);

/* ══ Google Sheets Auth ══ */
async function getAccessToken(){
    const header=btoa(JSON.stringify({alg:'RS256',typ:'JWT'})).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    const now=Math.floor(Date.now()/1000);
    const claim=btoa(JSON.stringify({iss:SERVICE_ACCOUNT_EMAIL,scope:'https://www.googleapis.com/auth/spreadsheets',aud:'https://oauth2.googleapis.com/token',exp:now+3600,iat:now})).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    const sigInput=header+'.'+claim;
    const keyData=PRIVATE_KEY.replace('-----BEGIN PRIVATE KEY-----','').replace('-----END PRIVATE KEY-----','').replace(/\n/g,'');
    const cryptoKey=await crypto.subtle.importKey('pkcs8',Uint8Array.from(atob(keyData),c=>c.charCodeAt(0)),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
    const sig=btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',cryptoKey,new TextEncoder().encode(sigInput))))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    const res=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:`grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${sigInput+'.'+sig}`});
    const d=await res.json(); return d.access_token;
}

async function sheetsGet(token,range){ return (await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}`,{headers:{Authorization:'Bearer '+token}})).json(); }
async function sheetsUpdate(token,range,values){ await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,{method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({values})}); }
async function sheetsAppend(token,range,values){ await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({values})}); }

async function sheetsDeleteRow(token, rowNum) {
    try {
        const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets(properties(sheetId,title))`, {headers:{Authorization:'Bearer '+token}});
        const metaData = await metaRes.json();
        const sheet = metaData.sheets.find(s => s.properties.title === '工作表1');
        const sheetId = sheet ? sheet.properties.sheetId : 0;
        const req = { requests: [{ deleteDimension: { range: { sheetId: sheetId, dimension: 'ROWS', startIndex: rowNum - 1, endIndex: rowNum } } }] };
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`, { method: 'POST', headers: {Authorization:'Bearer '+token, 'Content-Type': 'application/json'}, body: JSON.stringify(req) });
    } catch(e) { console.error('刪除名單列失敗:', e); }
}

async function initSheet(token){
    const data=await sheetsGet(token,'工作表1!A1:K1');
    if(!data.values||!data.values[0]||data.values[0][0]!=='member_id'){
        await sheetsUpdate(token,'工作表1!A1:K1',[['member_id','姓名','電話','業務','uid','進單日期','進單月份','目前狀態','等級(A/C)','備註','最後更新']]);
    }
}

let sheetToken=null, sheetData={}, sheetRowMap={};
let allData=[], detailData={}, currentItem=null, currentMemoItem=null, selectedGrade='';

async function loadSheetData(){
    try{
        sheetToken=await getAccessToken();
        await initSheet(sheetToken);
        const data=await sheetsGet(sheetToken,'工作表1!A:K');
        sheetData={};sheetRowMap={};
        if(data.values){
            data.values.forEach((row,idx)=>{
                if(idx===0)return;
                const memberId=row[0];
                if(memberId){
                    sheetData[memberId]={status:row[7]||'', grade:row[8]||'', memo:row[9]||''};
                    sheetRowMap[memberId]=idx+1;
                }
            });
        }
    }catch(e){console.log('Sheet載入失敗:',e);}
}

// 🌟 核心命名邏輯：強勢控管，只認字典！(如果忘記加字典，就寫入數字 UID 提醒主管)
function getWriterName(item) {
    if (USER_DICT[crmUid]) return USER_DICT[crmUid];
    return crmUid; 
}

async function syncNewMemberToSheet(item,assignDate){
    if(!sheetToken)return;
    const memberId=String(item.member_id);
    if(sheetRowMap[memberId])return; 
    const now=new Date();
    const month=`${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}`;
    const dateStr=assignDate||now.toISOString().split('T')[0];
    
    await sheetsAppend(sheetToken,'工作表1!A:K',[[memberId,item.member_name||'',item.mobile||'',getWriterName(item),crmUid,dateStr,month,'新單','','',now.toLocaleString('zh-TW')]]);
    sheetRowMap[memberId]=Object.keys(sheetRowMap).length+2;
}

async function updateSheetMemo(memberId, status, grade, memo, item){
    if(!sheetToken)return;
    const rowNum=sheetRowMap[String(memberId)];
    const now=new Date();
    const timeStr = now.toLocaleString('zh-TW');

    if(!rowNum){
        const month=`${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}`;
        const dateStr=now.toISOString().split('T')[0]; 
        await sheetsAppend(sheetToken,'工作表1!A:K',[[String(memberId), item.member_name||'', item.mobile||'', getWriterName(item), crmUid, dateStr, month, status, grade, memo, timeStr]]);
        sheetRowMap[String(memberId)] = Object.keys(sheetRowMap).length + 2; 
    } else {
        await sheetsUpdate(sheetToken,`工作表1!H${rowNum}:K${rowNum}`,[[status, grade, memo, timeStr]]);
    }
    sheetData[String(memberId)]={status, grade, memo};
}

/* ══ DOM UI 初始化 ══ */
['custom-crm-curtain','custom-crm-panel'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove();});
const curtain=document.createElement('div');
curtain.id='custom-crm-curtain';
curtain.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(236,240,241,0.85);backdrop-filter:blur(8px);z-index:999998;pointer-events:all;user-select:none;';
curtain.addEventListener('click',e=>e.stopPropagation());
document.body.style.overflow='hidden';
document.body.appendChild(curtain);

const panel=document.createElement('div');
panel.id='custom-crm-panel';
panel.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:1020px;height:88vh;background:#fff;box-shadow:0 15px 50px rgba(0,0,0,0.2);border-radius:12px;z-index:999999;display:flex;flex-direction:column;overflow:hidden;font-family:sans-serif;';

const header=document.createElement('div');
header.style.cssText='padding:12px 15px;background:#2c3e50;color:white;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;flex-shrink:0;';
header.innerHTML=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;"><h3 style="margin:0;font-size:15px;">📊 名單管理面板</h3>${isManager?'<select id="consultant-filter" style="padding:4px;border-radius:4px;border:none;max-width:150px;"><option value="-1">所有業務</option></select>':'<span style="font-size:12px;color:#bdc3c7;">我的名單</span>'}<select id="t-type-filter" style="padding:4px;border-radius:4px;border:none;"><option value="-1">所有種類</option><option value="1">新單</option><option value="2">常態名單</option><option value="3">Demo過名單</option><option value="4">釋出名單</option></select><button id="refresh-btn" style="padding:4px 10px;cursor:pointer;border-radius:4px;border:none;background:#3498db;color:white;">重新整理</button><span id="loading-status" style="font-size:11px;color:#f1c40f;font-weight:bold;"></span></div><button id="close-btn" style="background:transparent;border:none;color:white;font-size:20px;cursor:pointer;">×</button>`;

const content=document.createElement('div');
content.style.cssText='flex:1;overflow-y:auto;padding:12px;background:#f8f9fa;';

const memoModal=document.createElement('div');
memoModal.id='memo-modal';
memoModal.style.cssText='display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:340px;background:white;padding:20px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.25);z-index:1000001;';
memoModal.innerHTML=`<h4 style="margin:0 0 4px;">編輯備註</h4><div id="memo-member-name" style="font-size:12px;color:#7f8c8d;margin-bottom:14px;"></div><input type="hidden" id="memo-member-id"><div id="re-inquire-container" style="display:none; margin-bottom:12px;"><button id="memo-re-inquire-btn" data-active="false" style="width:100%; padding:8px; border:2px solid #ddd; border-radius:6px; cursor:pointer; font-weight:bold; font-size:13px; background:#fff; color:#555; transition:all 0.2s;">🚩 標記為「再次留單」</button></div><div style="margin-bottom:12px;"><label style="font-size:13px;font-weight:bold;">等級</label><div style="display:flex;gap:8px;margin-top:6px;"><button class="grade-btn" data-val="A" style="flex:1;padding:8px;border:2px solid #ddd;border-radius:6px;cursor:pointer;font-weight:bold;font-size:14px;background:#fff;">A 級</button><button class="grade-btn" data-val="C" style="flex:1;padding:8px;border:2px solid #ddd;border-radius:6px;cursor:pointer;font-weight:bold;font-size:14px;background:#fff;">C 級</button><button class="grade-btn" data-val="" style="flex:1;padding:8px;border:2px solid #ddd;border-radius:6px;cursor:pointer;font-size:13px;background:#fff;">清除</button></div></div><div style="margin-bottom:14px;"><label style="font-size:13px;font-weight:bold;">備註</label><textarea id="memo-text" style="width:100%;margin-top:6px;padding:8px;border:1px solid #ddd;border-radius:6px;font-family:sans-serif;font-size:13px;resize:vertical;min-height:70px;" placeholder="輸入備註..."></textarea></div><div style="display:flex;gap:8px;justify-content:flex-end;"><button id="memo-cancel" style="padding:6px 16px;cursor:pointer;border:1px solid #ddd;border-radius:6px;background:#fff;">取消</button><button id="memo-save" style="padding:6px 16px;cursor:pointer;border:none;border-radius:6px;background:#27ae60;color:white;font-weight:bold;">儲存</button></div>`;

const recordModal=document.createElement('div');
recordModal.id='record-modal';
recordModal.style.cssText='display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:300px;background:white;padding:20px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.2);z-index:1000000;';
recordModal.innerHTML='<h4 style="margin-top:0;">新增聯絡紀錄</h4><input type="hidden" id="modal-member-id"><div id="modal-info-text" style="font-size:11px;color:#e67e22;margin-bottom:10px;font-weight:bold;"></div><div style="margin-bottom:10px;"><label>聯絡類型:</label><select id="modal-status" style="width:100%;padding:5px;margin-top:5px;"><option value="3">未接</option><option value="1">已接聽</option><option value="2">非本人</option><option value="4">關機</option></select></div><div style="margin-bottom:10px;"><label>聯絡內容:</label><input type="text" id="modal-content" value="未接 *1" style="width:100%;padding:5px;margin-top:5px;"></div><div style="margin-bottom:10px;"><label>下次聯繫日期:</label><input type="date" id="modal-date" style="width:100%;padding:5px;margin-top:5px;"></div><div style="display:flex;justify-content:space-between;margin-top:15px;"><button id="modal-cancel" style="padding:5px 15px;cursor:pointer;">取消</button><button id="modal-submit" style="padding:5px 15px;background:#27ae60;color:white;border:none;cursor:pointer;border-radius:4px;">送出紀錄</button></div>';

panel.appendChild(header);
panel.appendChild(content);
panel.appendChild(memoModal);
panel.appendChild(recordModal);
document.body.appendChild(panel);

// 🚩 再次留單按鈕的切換邏輯
document.getElementById('memo-re-inquire-btn').onclick = (e) => {
    const btn = e.target;
    const isActive = btn.getAttribute('data-active') === 'true';
    if (isActive) {
        btn.setAttribute('data-active', 'false');
        btn.style.background = '#fff';
        btn.style.borderColor = '#ddd';
        btn.style.color = '#555';
        btn.innerText = '🚩 標記為「再次留單」';
    } else {
        btn.setAttribute('data-active', 'true');
        btn.style.background = '#c0392b';
        btn.style.borderColor = '#c0392b';
        btn.style.color = '#fff';
        btn.innerText = '✅ 已標記 (請點擊下方儲存)';
    }
};

memoModal.querySelectorAll('.grade-btn').forEach(btn=>{
    btn.onclick=()=>{
        selectedGrade=btn.dataset.val;
        memoModal.querySelectorAll('.grade-btn').forEach(b=>{ b.style.background='#fff';b.style.borderColor='#ddd';b.style.color='#333'; });
        if(selectedGrade==='A'){btn.style.background='#1a6fc4';btn.style.borderColor='#1a6fc4';btn.style.color='white';}
        else if(selectedGrade==='C'){btn.style.background='#e67e22';btn.style.borderColor='#e67e22';btn.style.color='white';}
        else{btn.style.background='#95a5a6';btn.style.borderColor='#95a5a6';btn.style.color='white';}
    };
});

document.getElementById('memo-save').onclick=async()=>{
    const memberId=document.getElementById('memo-member-id').value;
    const memo=document.getElementById('memo-text').value.trim();
    const isReInquire = document.getElementById('memo-re-inquire-btn').getAttribute('data-active') === 'true';
    const rowNum = sheetRowMap[String(memberId)];
    const sd = sheetData[String(memberId)] || {};

    const btn=document.getElementById('memo-save');
    btn.textContent='處理中...';btn.disabled=true;

    if (currentMemoItem.type != 1 && !isReInquire && rowNum) {
        await sheetsDeleteRow(sheetToken, rowNum);
        delete sheetData[String(memberId)];
        await loadSheetData(); 
    } else if (currentMemoItem.type == 1 || isReInquire) {
        let statusToSave = sd.status || '';
        if (currentMemoItem.type == 1) statusToSave = '新單';
        else if (isReInquire) statusToSave = '再次留單';
        await updateSheetMemo(memberId, statusToSave, selectedGrade, memo, currentMemoItem);
    }
    btn.textContent='儲存';btn.disabled=false;
    memoModal.style.display='none';
    renderList();
};
document.getElementById('memo-cancel').onclick=()=>memoModal.style.display='none';

function updateConsultantDropdown(){
    if(!isManager)return;
    const select=document.getElementById('consultant-filter');
    const names=[...new Set(allData.map(m=>m.user_name?m.user_name.trim():'未指派'))].sort();
    let html='<option value="-1">所有業務</option>';
    names.forEach(n=>{html+=`<option value="${n}">${n}</option>`;});
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
        
        updateConsultantDropdown();
        renderList();
        if(!isManager){ statusLabel.innerText='🔄 載入新單細節...'; await loadDetailsForAll(); }
        statusLabel.innerText='✅ 載入完成';
        setTimeout(()=>statusLabel.innerText='',2000);
    }catch(err){
        content.innerHTML=`<div style="color:red;text-align:center;">載入失敗: ${err.message}</div>`;
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
                const res=await fetch(`/admin/request_develop?member_id=${m.member_id}&hide_layout=true`);
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
        statusLabel.innerText=`🔄 新單細節 ${Math.min(i+5,targets.length)}/${targets.length}`;
        renderList();
    }
}

async function loadDetailsForConsultant(consultantName){
    const targets=allData.filter(m=>m.type==1&&(m.user_name||'').trim()===consultantName&&!detailData[m.member_id]);
    if(!targets.length)return;
    const statusLabel=document.getElementById('loading-status');
    statusLabel.innerText=`🔄 同步 ${consultantName} 的新單...`;
    for(let i=0;i<targets.length;i+=5){
        const batch=targets.slice(i,i+5);
        await Promise.all(batch.map(async m=>{
            try{
                const res=await fetch(`/admin/request_develop?member_id=${m.member_id}&hide_layout=true`);
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
        statusLabel.innerText=`🔄 ${consultantName} 新單 ${Math.min(i+5,targets.length)}/${targets.length}`;
        renderList();
    }
    statusLabel.innerText=`✅ ${consultantName} 同步完成`;
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
    const sourceHeader=isManager?'<th style="padding:6px;width:8%;">來源</th>':'';
    let html='<table style="width:100%;border-collapse:collapse;font-size:12px;">';
    html+=`<tr style="background:#e9ecef;text-align:left;position:sticky;top:0;"><th style="padding:6px;">姓名/狀態</th><th style="padding:6px;">電話</th><th style="padding:6px;width:12%;">等級</th><th style="padding:6px;width:18%;">備註</th><th style="padding:6px;width:18%;">下次聯繫 & 預警</th>${sourceHeader}<th style="padding:6px;">業務</th><th style="padding:6px;width:10%;">操作</th></tr>`;
    filteredData.slice(0,150).forEach(item=>{
        const id=item.member_id||item.id||'';
        const d=detailData[id];
        const sd=sheetData[String(id)]||{};
        const dropDays=getDropDaysLeft(item,d);
        const ts=typeStyles[String(item.type)]||{label:'其他',bg:'#95a5a6'};
        const rowBorderColor=dropDays!==null&&dropDays<=0?'#e74c3c':dropDays!==null&&dropDays<=2?'#e67e22':ts.bg;
        let warningHtml='';
        if(dropDays!==null){
            if(dropDays<0)warningHtml=`<br><span style="color:#c0392b;font-weight:bold;">🔥 已噴單(過期${Math.abs(dropDays)}天)</span>`;
            else if(dropDays===0)warningHtml=`<br><span style="color:#d35400;font-weight:bold;">🔥 今日噴單</span>`;
            else if(dropDays<=2)warningHtml=`<br><span style="color:#e67e22;font-weight:bold;">⚠️ 剩 ${dropDays} 天</span>`;
            else warningHtml=`<br><span style="color:#16a085;">距噴單 ${dropDays} 天</span>`;
        }else if(item.type==1&&!d){
            warningHtml=isManager&&selectedConsultant=='-1'?`<br><span style="color:#95a5a6;">請選取業務載入</span>`:`<br><span style="color:#95a5a6;">載入中...</span>`;
        }
        let progressHtml='';
        if(item.type==1){
            const count=d?d.contactCount:0;
            const pct=Math.min(100,(count/6)*100);
            const assignStr=(d&&d.assignDate)?d.assignDate:'待載入';
            progressHtml=`<div style="font-size:10px;color:#1a6fc4;margin-top:3px;">進單:${assignStr} 進度:${count}/6</div><div style="width:100%;height:3px;background:#ddd;border-radius:2px;margin-top:2px;"><div style="width:${pct}%;height:100%;background:${pct<100?'#3498db':'#27ae60'};border-radius:2px;"></div></div>`;
        }
        
        let reInquireHtml = sd.status === '再次留單' ? `<span style="background:#c0392b;color:white;padding:1px 5px;border-radius:3px;font-size:10px;margin-left:5px;display:inline-block;margin-top:3px;">再次留單</span>` : '';

        const btnBg=dropDays!==null&&dropDays<=0?'#e74c3c':ts.bg;
        const sourceCell=isManager?`<td style="padding:6px;color:#8e44ad;font-size:11px;vertical-align:top;">S:${item.source||'-'}</td>`:'';
        const gradeHtml=sd.grade?`<span style="background:${sd.grade==='A'?'#1a6fc4':'#e67e22'};color:white;padding:2px 8px;border-radius:4px;font-weight:bold;font-size:12px;">${sd.grade}</span>`:'<span style="color:#bdc3c7;font-size:11px;">未設定</span>';
        const memoHtml=sd.memo?`<span style="font-size:11px;color:#555;">${sd.memo.slice(0,20)}${sd.memo.length>20?'...':''}</span>`:'<span style="color:#bdc3c7;font-size:11px;">-</span>';
        html+=`<tr style="border-bottom:1px solid #dee2e6;border-left:4px solid ${rowBorderColor};"><td style="padding:6px;vertical-align:top;"><b>${item.member_name||'未知'}</b><br><span style="background:${ts.bg};color:white;padding:1px 5px;border-radius:3px;font-size:10px;">${ts.label}</span>${reInquireHtml}${progressHtml}</td><td style="padding:6px;vertical-align:top;">${item.mobile||'-'}</td><td style="padding:6px;vertical-align:middle;">${gradeHtml}</td><td style="padding:6px;vertical-align:middle;">${memoHtml}</td><td style="padding:6px;vertical-align:top;"><span style="color:#d35400;">${item.next_time&&!item.next_time.includes('0000')?item.next_time.split(' ')[0]:'無紀錄'}</span>${warningHtml}</td>${sourceCell}<td style="padding:6px;color:#7f8c8d;vertical-align:top;font-size:11px;">${item.user_name||'-'}</td><td style="padding:6px;vertical-align:top;"><div style="display:flex;flex-direction:column;gap:4px;"><button class="quick-record-btn" data-id="${id}" style="padding:3px 7px;background:${btnBg};color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:bold;">壓紀錄</button><button class="memo-btn" data-id="${id}" style="padding:3px 7px;background:#8e44ad;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;">備註</button></div></td></tr>`;
    });
    html+='</table>';
    if(filteredData.length>150)html+=`<div style="text-align:center;padding:10px;color:#888;">(共 ${filteredData.length} 筆，顯示前 150 筆)</div>`;
    content.innerHTML=html;

    document.querySelectorAll('.quick-record-btn').forEach(btn=>{
        btn.onclick=e=>{
            const memberId=e.target.getAttribute('data-id');
            const item=allData.find(m=>(m.member_id||m.id)==memberId);
            currentItem=item;
            document.getElementById('modal-member-id').value=memberId;
            const nextTarget=new Date();nextTarget.setDate(nextTarget.getDate()+(item.type==1?1:3));
            document.getElementById('modal-date').value=nextTarget.toISOString().split('T')[0];
            const d=detailData[memberId];
            document.getElementById('modal-info-text').innerText=item.type==1&&d?`【新單】已壓 ${d.contactCount} 次，目標 6 次，還需 ${Math.max(0,6-d.contactCount)} 次`:'';
            document.getElementById('modal-status').value='3';
            document.getElementById('modal-content').value='未接 *1';
            recordModal.style.display='block';
        };
    });

    document.querySelectorAll('.memo-btn').forEach(btn=>{
        btn.onclick=e=>{
            const memberId=e.target.getAttribute('data-id');
            const item=allData.find(m=>(m.member_id||m.id)==memberId);
            const sd=sheetData[String(memberId)]||{};
            currentMemoItem=item;
            
            document.getElementById('memo-member-id').value=memberId;
            document.getElementById('memo-member-name').textContent=`${item.member_name||''}　${item.mobile||''}`;
            document.getElementById('memo-text').value=sd.memo||'';
            
            const reInquireContainer = document.getElementById('re-inquire-container');
            const reInqBtn = document.getElementById('memo-re-inquire-btn');
            if (item.type == 1) {
                reInquireContainer.style.display = 'none';
            } else {
                reInquireContainer.style.display = 'block';
                const isReInq = (sd.status === '再次留單');
                reInqBtn.setAttribute('data-active', isReInq ? 'true' : 'false');
                reInqBtn.style.background = isReInq ? '#c0392b' : '#fff';
                reInqBtn.style.borderColor = isReInq ? '#c0392b' : '#ddd';
                reInqBtn.style.color = isReInq ? '#fff' : '#555';
                reInqBtn.innerText = isReInq ? '✅ 已標記 (請點擊下方儲存)' : '🚩 標記為「再次留單」';
            }

            selectedGrade=sd.grade||'';
            memoModal.querySelectorAll('.grade-btn').forEach(b=>{
                b.style.background='#fff';b.style.borderColor='#ddd';b.style.color='#333';
                if(b.dataset.val===selectedGrade&&selectedGrade){
                    b.style.background=selectedGrade==='A'?'#1a6fc4':'#e67e22';
                    b.style.borderColor=selectedGrade==='A'?'#1a6fc4':'#e67e22';
                    b.style.color='white';
                }
            });
            memoModal.style.display='block';
        };
    });
}

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
document.getElementById('modal-status').onchange=function(){
    const m={'1':'已接聽','2':'非本人','3':'未接','4':'關機'};
    document.getElementById('modal-content').value=(m[this.value]||'聯絡')+' *1';
};
if(isManager){
    document.getElementById('consultant-filter').onchange=function(){
        renderList();
        if(this.value!=='-1')loadDetailsForConsultant(this.value);
    };
}
fetchData();
})();
