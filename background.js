chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  console.log(changeInfo);
  if (changeInfo.status == "complete") {
    chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
      console.log(tabs);
      console.log(tabs[0].url);
      var url = new URL(tabs[0].url);
      var hostname = url.hostname;
      var domain = getDomain(hostname);
      if (await isSafeDomain(domain)) {
        return;
      }

      if (await isPhishing(domain)) {
        console.log('send message');
        chrome.tabs.sendMessage(tabId, {type: 'phishing_warning', domain: domain});
      }
    });
  }
})

function getDomain(hostname) {
  var parts = hostname.split('.');
  if (parts.length > 2) {
    return parts.slice(parts.length - 2).join('.');
  } else {
    return hostname;
  }
}
async function isSafeDomain(domain) {
  return new Promise(resolve => {
    chrome.storage.sync.get("safeDomains", function(result) {
      let safeDomains = result.safeDomains || [];
      resolve(safeDomains.includes(domain));
    });
  })
}
async function isPhishing(domain) {
  return new Promise(resolve => {
    chrome.storage.sync.get("domains", function(result) {
      let domains = result.domains || [];

      for (let i = 0; i < domains.length; i++) {
        let threatbookDomain = domains[i];
        if (domain === threatbookDomain) {
          resolve(false);
          return;
        }
      }
      for (let i = 0; i < domains.length; i++) {
        if (getLevenshteinDistance(domain, threatbookDomain) <= 3) {
          resolve(true);
          return;
        }
      }
      resolve(false);
    });
  })
}

function getLevenshteinDistance(s, t) {
  var d = [];
  var n = s.length;
  var m = t.length;

  if (n === 0) return m;
  if (m === 0) return n;

  for (var i = 0; i <= n; i++) {
    d[i] = [];
    d[i][0] = i;
  }

  for (var j = 0; j <= m; j++) {
    d[0][j] = j;
  }

  for (var i = 1; i <= n; i++) {
    for (var j = 1; j <= m; j++) {
      var cost = s.charAt(i - 1) === t.charAt(j - 1) ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }

  return d[n][m];
}

