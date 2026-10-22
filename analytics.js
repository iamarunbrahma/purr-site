// Page analytics with PostHog in cookieless mode: no cookies, no local or session storage,
// no session recording, no IP stored. It loads after the page has finished, so it never
// delays the first paint. What it records is listed in privacy.html.
//
// Events for the drop-off funnels:
//   $pageview / $pageleave       PostHog's own, with scroll depth on leave
//   section_viewed {section}     a <main> section with an id reached the middle of the screen
//   <data-track value>           a click on any link or button marked data-track="..."
//                                (download_clicked, buy_clicked, app_store_clicked, ...)
// Every event carries site: the value of data-site on this script tag.
(function () {
  var site = document.currentScript && document.currentScript.dataset.site;

  function start() {
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagResult reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

    posthog.init('phc_AYdojXAfrQ9HS7YZqWxGUWKFVvHcYxV3kVWkbxHSaPYF', {
      api_host: 'https://us.i.posthog.com',
      defaults: '2026-05-30',
      cookieless_mode: 'always',
      person_profiles: 'never',
      disable_session_recording: true,
      enable_heatmaps: true
    });
    posthog.register({ site: site });

    if (!('IntersectionObserver' in window)) return;
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        posthog.capture('section_viewed', { section: entry.target.id });
        seen.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { seen.observe(s); });
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-track]');
    if (!el || !window.posthog || !posthog.capture) return;
    // sendBeacon so the event survives the page navigating away.
    posthog.capture(el.dataset.track, { href: el.href || null, text: (el.textContent || '').trim().slice(0, 60) },
      { transport: 'sendBeacon' });
  });

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
