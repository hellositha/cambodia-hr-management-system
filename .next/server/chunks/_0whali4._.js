module.exports=[61889,e=>{"use strict";var t=e.i(89171),a=e.i(93458),r=e.i(43793);async function n(e,{params:i}){try{let{id:n}=await i,s=(0,r.getDb)(),{status:o,stage:l,reviewer_id:d="emp-13",reviewer_comments:u="",reviewer_role:p}=await e.json(),m=await (0,a.cookies)(),c=p||m.get("hestra_role")?.value||"Admin",E=s.prepare("SELECT * FROM leave_requests WHERE id = ?").get(n);if(!E)return t.NextResponse.json({error:"Leave request not found"},{status:404});let _=new Date().toISOString();if("Rejected"===o){let e="Pending Manager"===E.status||"Pending"===E.status||"Manager"===c;s.prepare(`
        UPDATE leave_requests SET
          status = 'Rejected',
          reviewer_id = ?,
          reviewed_at = ?,
          reviewer_comments = ?,
          line_manager_id = CASE WHEN ? THEN ? ELSE line_manager_id END,
          line_manager_reviewed_at = CASE WHEN ? THEN ? ELSE line_manager_reviewed_at END,
          line_manager_comments = CASE WHEN ? THEN ? ELSE line_manager_comments END,
          admin_reviewer_id = CASE WHEN NOT ? THEN ? ELSE admin_reviewer_id END,
          admin_reviewed_at = CASE WHEN NOT ? THEN ? ELSE admin_reviewed_at END,
          admin_comments = CASE WHEN NOT ? THEN ? ELSE admin_comments END
        WHERE id = ?
      `).run(d,_,u,+!!e,d,+!!e,_,+!!e,u,+!!e,d,+!!e,_,+!!e,u,n)}else if("manager"===l||"Pending Admin"===o||("Pending Manager"===E.status||"Pending"===E.status)&&"Manager"===c||("Pending Manager"===E.status||"Pending"===E.status)&&"Approved"===o&&"Admin"!==c){let e=u||"Approved by Line Manager. Forwarded to HR Administrator for final approval.";s.prepare(`
        UPDATE leave_requests SET
          status = 'Pending Admin',
          line_manager_id = ?,
          line_manager_reviewed_at = ?,
          line_manager_comments = ?,
          reviewer_id = ?,
          reviewed_at = ?,
          reviewer_comments = ?
        WHERE id = ?
      `).run(d,_,e,d,_,e,n)}else{if("Approved"!==o&&"admin"!==l)return t.NextResponse.json({error:"Invalid approval status or stage"},{status:400});if("Pending Admin"===E.status&&"Manager"===c)return t.NextResponse.json({error:"ជំហានទី២ តម្រូវឱ្យមានការអនុម័តពីរដ្ឋបាល HR Admin (Step 2 requires Administrator approval)"},{status:403});let e=u||"Final approval granted by HR Administrator.";if(s.prepare(`
        UPDATE leave_requests SET
          status = 'Approved',
          admin_reviewer_id = ?,
          admin_reviewed_at = ?,
          admin_comments = ?,
          reviewer_id = ?,
          reviewed_at = ?,
          reviewer_comments = ?
        WHERE id = ?
      `).run(d,_,e,d,_,e,n),"Approved"!==E.status){let e="Sick"===E.leave_type?"sick_used":"Casual"===E.leave_type?"casual_used":"annual_used";s.prepare(`
          UPDATE leave_balances 
          SET ${e} = ${e} + ?
          WHERE employee_id = ?
        `).run(E.days_count,E.employee_id)}}let v=s.prepare(`
      SELECT 
        lr.*,
        COALESCE(e.first_name || ' ' || e.last_name, u.name, 'Staff Member') as employee_name,
        COALESCE(e.role, u.role, 'Employee') as employee_role,
        COALESCE(e.avatar, u.avatar, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces') as employee_avatar,
        COALESCE(lm.first_name || ' ' || lm.last_name, lmu.name) as line_manager_name,
        COALESCE(adm.first_name || ' ' || adm.last_name, admu.name) as admin_reviewer_name,
        COALESCE(r.first_name || ' ' || r.last_name, ru.name) as reviewer_name
      FROM leave_requests lr
      LEFT JOIN employees e ON e.id = lr.employee_id
      LEFT JOIN users u ON (u.id = lr.employee_id OR u.employee_id = lr.employee_id)
      LEFT JOIN employees lm ON lm.id = lr.line_manager_id
      LEFT JOIN users lmu ON (lmu.id = lr.line_manager_id OR lmu.employee_id = lr.line_manager_id)
      LEFT JOIN employees adm ON adm.id = lr.admin_reviewer_id
      LEFT JOIN users admu ON (admu.id = lr.admin_reviewer_id OR admu.employee_id = lr.admin_reviewer_id)
      LEFT JOIN employees r ON r.id = lr.reviewer_id
      LEFT JOIN users ru ON (ru.id = lr.reviewer_id OR ru.employee_id = lr.reviewer_id)
      WHERE lr.id = ?
    `).get(n);return t.NextResponse.json(v)}catch(e){return console.error("Error reviewing leave request:",e),t.NextResponse.json({error:e.message},{status:500})}}e.s(["PATCH",0,n,"dynamic",0,"force-dynamic"])},29687,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),n=e.i(59756),i=e.i(61916),s=e.i(74677),o=e.i(69741),l=e.i(16795),d=e.i(87718),u=e.i(95169),p=e.i(47587),m=e.i(66012),c=e.i(70101),E=e.i(26937),_=e.i(10372),v=e.i(93695);e.i(52474);var R=e.i(220);let g=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/leaves/[id]/route",pathname:"/api/leaves/[id]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/leaves/[id]/route.ts",nextConfigOutput:"",userland:()=>e.r(61889),...{}}),{workAsyncStorage:h,workUnitAsyncStorage:w,serverHooks:N}=g;async function A(e,t,r){r.requestMeta&&(0,n.setRequestMeta)(e,r.requestMeta),g.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let h="/api/leaves/[id]/route";h=h.replace(/\/index$/,"")||"/";let w=await g.prepare(e,t,{srcPage:h,multiZoneDraftMode:!1});if(!w)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:N,deploymentId:A,params:C,nextConfig:f,parsedUrl:T,isDraftMode:S,prerenderManifest:y,routerServerContext:O,isOnDemandRevalidate:H,revalidateOnlyGenerated:P,resolvedPathname:x,clientReferenceManifest:L,serverActionsManifest:b}=w,q=(0,o.normalizeAppPath)(h),I=!!(y.dynamicRoutes[q]||y.routes[x]),M=async()=>((null==O?void 0:O.render404)?await O.render404(e,t,T,!1):t.end("This page could not be found"),null);if(I&&!S){let e=!!y.routes[x],t=y.dynamicRoutes[q];if(t&&!1===t.fallback&&!e){if(f.adapterPath)return await M();throw new v.NoFallbackError}}let D=null;!I||g.isDev||S||(D="/index"===(D=x)?"/":D);let F=!0===g.isDev||!I,U=I&&!F;b&&L&&(0,s.setManifestsSingleton)({page:h,clientReferenceManifest:L,serverActionsManifest:b});let k=e.method||"GET",j=(0,i.getTracer)(),W=j.getActiveScopeSpan(),$=!!(null==O?void 0:O.isWrappedByNextServer),J=!!(0,n.getRequestMeta)(e,"minimalMode"),K=(0,n.getRequestMeta)(e,"incrementalCache")||await g.getIncrementalCache(e,f,y,J);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let B={params:C,previewProps:y.preview,renderOpts:{experimental:{authInterrupts:!!f.experimental.authInterrupts,useCacheTimeout:f.experimental.useCacheTimeout},cacheComponents:!!f.cacheComponents,validationLevel:f.experimental.instantInsights.validationLevel,supportsDynamicResponse:F,incrementalCache:K,hmrRefreshHash:(0,n.getRequestMeta)(e,"hmrRefreshHash"),cacheLifeProfiles:f.cacheLife,staticPageGenerationTimeout:f.staticPageGenerationTimeout,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>g.onRequestError(e,t,r,n,O)},sharedContext:{buildId:N,deploymentId:A}},G=new l.NodeNextRequest(e),V=new l.NodeNextResponse(t),X=d.NextRequestAdapter.fromNodeNextRequest(G,(0,d.signalFromNodeResponse)(t)),z=async({previousCacheEntry:a})=>{try{if(!J&&H&&P&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await g.handle(X,B);e.fetchMetrics=B.renderOpts.fetchMetrics;let i=B.renderOpts.pendingWaitUntil;i&&r.waitUntil&&(r.waitUntil(i),i=void 0);let s=B.renderOpts.collectedTags;if(!I)return await (0,m.sendResponse)(G,V,n,i),null;{let e=await n.blob(),t=(0,c.toNodeOutgoingHttpHeaders)(n.headers);s&&(t[_.NEXT_CACHE_TAGS_HEADER]=s),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=_.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,r=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=_.INFINITE_CACHE?!1!==a&&a>0?f.expireTime:void 0:B.renderOpts.collectedExpire;return{value:{kind:R.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await g.onRequestError(e,t,{routerKind:"App Router",routePath:h,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:H})},!1,O),t}},Z=async(n,s)=>{try{var o,l;let n=await g.handleResponse({req:e,nextConfig:f,cacheKey:D,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:H,revalidateOnlyGenerated:P,responseGenerator:z,waitUntil:r.waitUntil,isMinimalMode:J});if(!I)return;if((null==n||null==(o=n.value)?void 0:o.kind)!==R.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==n||null==(l=n.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});J||t.setHeader("x-nextjs-cache",H?"REVALIDATED":n.isMiss?"MISS":n.isStale?"STALE":"HIT"),S&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let i=(0,c.fromNodeOutgoingHttpHeaders)(n.value.headers);J&&I||i.delete(_.NEXT_CACHE_TAGS_HEADER),!n.cacheControl||t.getHeader("Cache-Control")||i.get("Cache-Control")||i.set("Cache-Control",(0,E.getCacheControlHeader)(n.cacheControl)),await (0,m.sendResponse)(G,V,new Response(n.value.body,{headers:i,status:n.value.status||200}));return}catch(t){if(t instanceof v.NoFallbackError||await g.onRequestError(e,t,{routerKind:"App Router",routePath:q,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:H})},!1,O),I)throw t;await (0,m.sendResponse)(G,V,new Response(null,{status:500}));return}finally{(()=>{if(!n)return;let e=t.statusCode;n.setAttributes({"http.status_code":e,"next.rsc":!1}),e&&e>=500&&(n.setStatus({code:i.SpanStatusCode.ERROR}),n.setAttribute("error.type",e.toString()));let a=j.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route")||q,o=`${k} ${r}`;n.setAttributes({"next.route":r,"http.route":r,"next.span_name":o}),n.updateName(o),s&&s!==n&&(s.setAttribute("http.route",r),s.updateName(o))})()}};if($&&W)await Z(W,void 0);else{let t=j.getActiveScopeSpan();await j.withPropagatedContext(e.headers,()=>j.trace(u.BaseServerSpan.handleRequest,{spanName:`${k} ${h}`,kind:i.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},e=>Z(e,t)),void 0,!$)}}e.s(["handler",0,A,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:h,workUnitAsyncStorage:w})},"routeModule",0,g,"serverHooks",0,N,"workAsyncStorage",0,h,"workUnitAsyncStorage",0,w])}];

//# sourceMappingURL=_0whali4._.js.map