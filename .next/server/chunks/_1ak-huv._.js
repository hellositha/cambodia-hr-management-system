module.exports=[96220,e=>{"use strict";var t=e.i(89171),a=e.i(43793);async function r(e,{params:n}){try{let{id:e}=await n,r=(0,a.getDb)(),o=r.prepare(`
      SELECT 
        e.*,
        d.name as department_name,
        d.color as department_color,
        m.first_name || ' ' || m.last_name as manager_name
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN employees m ON m.id = e.manager_id
      WHERE e.id = ?
    `).get(e);if(!o)return t.NextResponse.json({error:"Employee not found"},{status:404});let i=r.prepare("SELECT * FROM leave_balances WHERE employee_id = ?").get(e),l=r.prepare(`
      SELECT * FROM attendance 
      WHERE employee_id = ? 
      ORDER BY date DESC 
      LIMIT 14
    `).all(e),s=r.prepare(`
      SELECT 
        lr.*,
        COALESCE(lm.first_name || ' ' || lm.last_name, lmu.name) as line_manager_name,
        COALESCE(adm.first_name || ' ' || adm.last_name, admu.name) as admin_reviewer_name,
        COALESCE(m.first_name || ' ' || m.last_name, mu.name) as reviewer_name
      FROM leave_requests lr
      LEFT JOIN employees lm ON lm.id = lr.line_manager_id
      LEFT JOIN users lmu ON (lmu.id = lr.line_manager_id OR lmu.employee_id = lr.line_manager_id)
      LEFT JOIN employees adm ON adm.id = lr.admin_reviewer_id
      LEFT JOIN users admu ON (admu.id = lr.admin_reviewer_id OR admu.employee_id = lr.admin_reviewer_id)
      LEFT JOIN employees m ON m.id = lr.reviewer_id
      LEFT JOIN users mu ON (mu.id = lr.reviewer_id OR mu.employee_id = lr.reviewer_id)
      WHERE lr.employee_id = ?
      ORDER BY lr.created_at DESC
    `).all(e),d=r.prepare(`
      SELECT * FROM payrolls
      WHERE employee_id = ?
      ORDER BY payment_date DESC
    `).all(e),u=r.prepare(`
      SELECT pr.*, m.first_name || ' ' || m.last_name as reviewer_name
      FROM performance_reviews pr
      LEFT JOIN employees m ON m.id = pr.reviewer_id
      WHERE pr.employee_id = ?
      ORDER BY pr.created_at DESC
    `).all(e);return t.NextResponse.json({employee:o,leaveBalance:i,attendance:l,leaves:s,payrolls:d,reviews:u})}catch(e){return console.error("Error fetching employee details:",e),t.NextResponse.json({error:e.message},{status:500})}}async function n(e,{params:r}){try{let{id:n}=await r,o=(0,a.getDb)(),{first_name:i,last_name:l,email:s,phone:d,role:u,department_id:c,employment_type:m,status:E,salary:p,location:_,bio:C,emergency_contact_name:v,emergency_contact_phone:O,gender:R,dob:y,nationality:h,marital_status:S,national_id:g,current_address:A,province_city:L,district:f,commune_sangkat:T,village:w,employee_type:N,join_date:b,contract_type:x,contract_start:I,contract_end:P,manager_id:H,work_location:D,salary_currency:F,salary_frequency:M,bank_name:k,bank_account_name:q,bank_account_number:U,nssf_member:j,nssf_number:W,nssf_reg_date:J,emergency_contact_relationship:B,emergency_contact_address:K,avatar:$,doc_national_id:G,doc_passport:Y,doc_contract:V,doc_others:X}=await e.json();o.prepare(`
      UPDATE employees SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        role = COALESCE(?, role),
        department_id = COALESCE(?, department_id),
        employment_type = COALESCE(?, employment_type),
        status = COALESCE(?, status),
        salary = COALESCE(?, salary),
        location = COALESCE(?, location),
        bio = COALESCE(?, bio),
        emergency_contact_name = COALESCE(?, emergency_contact_name),
        emergency_contact_phone = COALESCE(?, emergency_contact_phone),
        gender = COALESCE(?, gender),
        dob = COALESCE(?, dob),
        nationality = COALESCE(?, nationality),
        marital_status = COALESCE(?, marital_status),
        national_id = COALESCE(?, national_id),
        current_address = COALESCE(?, current_address),
        province_city = COALESCE(?, province_city),
        district = COALESCE(?, district),
        commune_sangkat = COALESCE(?, commune_sangkat),
        village = COALESCE(?, village),
        employee_type = COALESCE(?, employee_type),
        join_date = COALESCE(?, join_date),
        contract_type = COALESCE(?, contract_type),
        contract_start = COALESCE(?, contract_start),
        contract_end = COALESCE(?, contract_end),
        manager_id = COALESCE(?, manager_id),
        work_location = COALESCE(?, work_location),
        salary_currency = COALESCE(?, salary_currency),
        salary_frequency = COALESCE(?, salary_frequency),
        bank_name = COALESCE(?, bank_name),
        bank_account_name = COALESCE(?, bank_account_name),
        bank_account_number = COALESCE(?, bank_account_number),
        nssf_member = COALESCE(?, nssf_member),
        nssf_number = COALESCE(?, nssf_number),
        nssf_reg_date = COALESCE(?, nssf_reg_date),
        emergency_contact_relationship = COALESCE(?, emergency_contact_relationship),
        emergency_contact_address = COALESCE(?, emergency_contact_address),
        avatar = COALESCE(?, avatar),
        doc_national_id = COALESCE(?, doc_national_id),
        doc_passport = COALESCE(?, doc_passport),
        doc_contract = COALESCE(?, doc_contract),
        doc_others = COALESCE(?, doc_others)
      WHERE id = ?
    `).run(void 0!==i?i:null,void 0!==l?l:null,void 0!==s?s:null,void 0!==d?d:null,void 0!==u?u:null,void 0!==c?c:null,void 0!==m?m:null,void 0!==E?E:null,void 0!==p?Number(p):null,void 0!==_?_:null,void 0!==C?C:null,void 0!==v?v:null,void 0!==O?O:null,void 0!==R?R:null,void 0!==y?y:null,void 0!==h?h:null,void 0!==S?S:null,void 0!==g?g:null,void 0!==A?A:null,void 0!==L?L:null,void 0!==f?f:null,void 0!==T?T:null,void 0!==w?w:null,void 0!==N?N:null,void 0!==b?b:null,void 0!==x?x:null,void 0!==I?I:null,void 0!==P?P:null,void 0!==H?H:null,void 0!==D?D:null,void 0!==F?F:null,void 0!==M?M:null,void 0!==k?k:null,void 0!==q?q:null,void 0!==U?U:null,void 0!==j?j:null,void 0!==W?W:null,void 0!==J?J:null,void 0!==B?B:null,void 0!==K?K:null,void 0!==$?$:null,void 0!==G?G:null,void 0!==Y?Y:null,void 0!==V?V:null,void 0!==X?X:null,n),i&&o.prepare("UPDATE users SET username = ? WHERE employee_id = ?").run(i.trim().toLowerCase(),n);let z=o.prepare(`
      SELECT 
        e.*,
        d.name as department_name,
        m.first_name || ' ' || m.last_name as manager_name
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN employees m ON m.id = e.manager_id
      WHERE e.id = ?
    `).get(n);return t.NextResponse.json(z)}catch(e){return console.error("Error updating employee:",e),t.NextResponse.json({error:e.message},{status:500})}}async function o(e,{params:r}){try{let{id:e}=await r;return(0,a.getDb)().prepare("UPDATE employees SET status = 'Terminated' WHERE id = ?").run(e),t.NextResponse.json({success:!0,message:"Employee status set to Terminated"})}catch(e){return console.error("Error deleting employee:",e),t.NextResponse.json({error:e.message},{status:500})}}e.s(["DELETE",0,o,"GET",0,r,"PUT",0,n,"dynamic",0,"force-dynamic"])},26190,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),n=e.i(59756),o=e.i(61916),i=e.i(74677),l=e.i(69741),s=e.i(16795),d=e.i(87718),u=e.i(95169),c=e.i(47587),m=e.i(66012),E=e.i(70101),p=e.i(26937),_=e.i(10372),C=e.i(93695);e.i(52474);var v=e.i(220);let O=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/employees/[id]/route",pathname:"/api/employees/[id]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/employees/[id]/route.ts",nextConfigOutput:"",userland:()=>e.r(96220),...{}}),{workAsyncStorage:R,workUnitAsyncStorage:y,serverHooks:h}=O;async function S(e,t,r){r.requestMeta&&(0,n.setRequestMeta)(e,r.requestMeta),O.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let R="/api/employees/[id]/route";R=R.replace(/\/index$/,"")||"/";let y=await O.prepare(e,t,{srcPage:R,multiZoneDraftMode:!1});if(!y)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:h,deploymentId:S,params:g,nextConfig:A,parsedUrl:L,isDraftMode:f,prerenderManifest:T,routerServerContext:w,isOnDemandRevalidate:N,revalidateOnlyGenerated:b,resolvedPathname:x,clientReferenceManifest:I,serverActionsManifest:P}=y,H=(0,l.normalizeAppPath)(R),D=!!(T.dynamicRoutes[H]||T.routes[x]),F=async()=>((null==w?void 0:w.render404)?await w.render404(e,t,L,!1):t.end("This page could not be found"),null);if(D&&!f){let e=!!T.routes[x],t=T.dynamicRoutes[H];if(t&&!1===t.fallback&&!e){if(A.adapterPath)return await F();throw new C.NoFallbackError}}let M=null;!D||O.isDev||f||(M="/index"===(M=x)?"/":M);let k=!0===O.isDev||!D,q=D&&!k;P&&I&&(0,i.setManifestsSingleton)({page:R,clientReferenceManifest:I,serverActionsManifest:P});let U=e.method||"GET",j=(0,o.getTracer)(),W=j.getActiveScopeSpan(),J=!!(null==w?void 0:w.isWrappedByNextServer),B=!!(0,n.getRequestMeta)(e,"minimalMode"),K=(0,n.getRequestMeta)(e,"incrementalCache")||await O.getIncrementalCache(e,A,T,B);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let $={params:g,previewProps:T.preview,renderOpts:{experimental:{authInterrupts:!!A.experimental.authInterrupts,useCacheTimeout:A.experimental.useCacheTimeout},cacheComponents:!!A.cacheComponents,validationLevel:A.experimental.instantInsights.validationLevel,supportsDynamicResponse:k,incrementalCache:K,hmrRefreshHash:(0,n.getRequestMeta)(e,"hmrRefreshHash"),cacheLifeProfiles:A.cacheLife,staticPageGenerationTimeout:A.staticPageGenerationTimeout,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>O.onRequestError(e,t,r,n,w)},sharedContext:{buildId:h,deploymentId:S}},G=new s.NodeNextRequest(e),Y=new s.NodeNextResponse(t),V=d.NextRequestAdapter.fromNodeNextRequest(G,(0,d.signalFromNodeResponse)(t)),X=async({previousCacheEntry:a})=>{try{if(!B&&N&&b&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await O.handle(V,$);e.fetchMetrics=$.renderOpts.fetchMetrics;let o=$.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let i=$.renderOpts.collectedTags;if(!D)return await (0,m.sendResponse)(G,Y,n,o),null;{let e=await n.blob(),t=(0,E.toNodeOutgoingHttpHeaders)(n.headers);i&&(t[_.NEXT_CACHE_TAGS_HEADER]=i),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==$.renderOpts.collectedRevalidate&&!($.renderOpts.collectedRevalidate>=_.INFINITE_CACHE)&&$.renderOpts.collectedRevalidate,r=void 0===$.renderOpts.collectedExpire||$.renderOpts.collectedExpire>=_.INFINITE_CACHE?!1!==a&&a>0?A.expireTime:void 0:$.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await O.onRequestError(e,t,{routerKind:"App Router",routePath:R,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:N})},!1,w),t}},z=async(n,i)=>{try{var l,s;let n=await O.handleResponse({req:e,nextConfig:A,cacheKey:M,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:T,isRoutePPREnabled:!1,isOnDemandRevalidate:N,revalidateOnlyGenerated:b,responseGenerator:X,waitUntil:r.waitUntil,isMinimalMode:B});if(!D)return;if((null==n||null==(l=n.value)?void 0:l.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==n||null==(s=n.value)?void 0:s.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});B||t.setHeader("x-nextjs-cache",N?"REVALIDATED":n.isMiss?"MISS":n.isStale?"STALE":"HIT"),f&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let o=(0,E.fromNodeOutgoingHttpHeaders)(n.value.headers);B&&D||o.delete(_.NEXT_CACHE_TAGS_HEADER),!n.cacheControl||t.getHeader("Cache-Control")||o.get("Cache-Control")||o.set("Cache-Control",(0,p.getCacheControlHeader)(n.cacheControl)),await (0,m.sendResponse)(G,Y,new Response(n.value.body,{headers:o,status:n.value.status||200}));return}catch(t){if(t instanceof C.NoFallbackError||await O.onRequestError(e,t,{routerKind:"App Router",routePath:H,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:N})},!1,w),D)throw t;await (0,m.sendResponse)(G,Y,new Response(null,{status:500}));return}finally{(()=>{if(!n)return;let e=t.statusCode;n.setAttributes({"http.status_code":e,"next.rsc":!1}),e&&e>=500&&(n.setStatus({code:o.SpanStatusCode.ERROR}),n.setAttribute("error.type",e.toString()));let a=j.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route")||H,l=`${U} ${r}`;n.setAttributes({"next.route":r,"http.route":r,"next.span_name":l}),n.updateName(l),i&&i!==n&&(i.setAttribute("http.route",r),i.updateName(l))})()}};if(J&&W)await z(W,void 0);else{let t=j.getActiveScopeSpan();await j.withPropagatedContext(e.headers,()=>j.trace(u.BaseServerSpan.handleRequest,{spanName:`${U} ${R}`,kind:o.SpanKind.SERVER,attributes:{"http.method":U,"http.target":e.url}},e=>z(e,t)),void 0,!J)}}e.s(["handler",0,S,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:R,workUnitAsyncStorage:y})},"routeModule",0,O,"serverHooks",0,h,"workAsyncStorage",0,R,"workUnitAsyncStorage",0,y])}];

//# sourceMappingURL=_1ak-huv._.js.map