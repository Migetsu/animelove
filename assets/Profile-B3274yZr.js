import{g as u,i as p,r as _,j as d,c as t,a as o,t as h,o as s,p as m,m as f}from"./index-ShTBOiLZ.js";const l=e=>(m("data-v-54939b96"),e=e(),f(),e),k={class:"profile"},v={class:"container"},g=l(()=>o("h1",{class:"profile__title"},"Мой профиль",-1)),S={key:0,class:"profile__loading"},I=l(()=>o("p",null,"Загрузка данных профиля...",-1)),b=[I],x={key:1,class:"profile__error"},y={key:2,class:"profile__content"},B=l(()=>o("p",null,"Вы успешно авторизованы через Shikimori!",-1)),C={__name:"Profile",setup(e){const n=p(),i=_(!0),a=_(null);d(()=>{if(!localStorage.getItem("shikimori_token")){a.value="Не авторизован. Пожалуйста, войдите через Shikimori.",i.value=!1;return}setTimeout(()=>{i.value=!1},1e3)});function r(){localStorage.removeItem("shikimori_token"),localStorage.removeItem("shikimori_refresh_token"),localStorage.removeItem("shikimori_token_expires_at"),n.push("/")}return(c,P)=>(s(),t("main",k,[o("div",v,[g,i.value?(s(),t("div",S,b)):a.value?(s(),t("div",x,[o("p",null,h(a.value),1),o("button",{onClick:r,class:"profile__button"},"Выйти")])):(s(),t("div",y,[B,o("button",{onClick:r,class:"profile__button"},"Выйти")]))])]))}},w=u(C,[["__scopeId","data-v-54939b96"]]);export{w as default};
//# sourceMappingURL=Profile-B3274yZr.js.map
