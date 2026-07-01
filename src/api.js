import { APPS_SCRIPT_URL } from './config.js';

export async function gasGet(params){
    const url=APPS_SCRIPT_URL+'?'+new URLSearchParams(params).toString();
    const res=await fetch(url);
    const text=await res.text();
    try { return JSON.parse(text); } catch(e) { return { error: '解析失敗' }; }
}

export async function gasPost(data){
    const res=await fetch(APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(data)});
    const text=await res.text();
    try { return JSON.parse(text); } catch(e) { return { success: false, error: '解析失敗' }; }
}

export async function initSheet(){ await gasGet({action:'init'}); }
export async function readSheet(){ return gasGet({action:'read'}); }
export async function appendRow(values){ return gasPost({action:'append',values}); }
export async function updateRow(rowNum,values){ return gasPost({action:'update',rowNum,values}); }
export async function deleteRow(rowNum){ return gasPost({action:'delete',rowNum}); }
