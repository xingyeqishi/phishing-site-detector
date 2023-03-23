var domain = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'phishing_warning') {
    domain = request.domain;
    showPhishingWarning();
  }
});
function showPhishingWarning() {
   var warningDiv = document.createElement('div');
   warningDiv.style.position = 'fixed';
   warningDiv.style.top = '0';
   warningDiv.style.left = '0';
   warningDiv.style.width = '100%';
   warningDiv.style.height = '100%';
   warningDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
   warningDiv.style.zIndex = '9999';

   var warningText = document.createElement('p');
   warningText.style.position = 'absolute';
   warningText.style.top = '50%';
   warningText.style.left = '50%';
   warningText.style.transform = 'translate(-50%, -50%)';
   warningText.style.color = 'white';
   warningText.style.fontSize = '24px';
   warningText.innerHTML = '注意：您正在访问一个可能是钓鱼网站的变体，其主域名为 ' + domain;

   var closeButton = document.createElement('button');
   closeButton.style.position = 'absolute';
   closeButton.style.top = '20px';
   closeButton.style.right = '20px';
   closeButton.style.fontSize = '18px';
   closeButton.innerHTML = '关闭';
   closeButton.onclick = function() {
     warningDiv.remove();
     domain = null;
   };

   var securityButton = document.createElement('button');
   securityButton.style.position = 'absolute';
   securityButton.style.bottom = '20px';
   securityButton.style.left = '50%';
   securityButton.style.transform = 'translate(-50%, 0)';
   securityButton.style.fontSize = '18px';
   securityButton.innerHTML = '标记为安全';
   securityButton.onclick = function() {
     chrome.storage.sync.get("safeDomains", function(result) {
       let safeDomains = result.safeDomains || [];

       if (!safeDomains.includes(domain)) {
         safeDomains.push(domain);

         chrome.storage.sync.set({ safeDomains }, function() {
           alert('已将 ' + domain + ' 标记为安全网站');
           warningDiv.remove();
           domain = null;
         });
       }
     });
   };

   warningDiv.appendChild(warningText);
   warningDiv.appendChild(closeButton);
  warningDiv.appendChild(securityButton);
  document.body.appendChild(warningDiv);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'check_security') {
    var url = new URL(window.location.href);
    var hostname = url.hostname;
    var domain = getDomain(hostname);
    chrome.storage.sync.get(domain, function(result) {
      if (result[domain]) {
        console.log(domain + ' 是安全网站');
      } else {
        console.log(domain + ' 可能是钓鱼网站');
        showPhishingWarning();
      }
    });
  }
});

function getDomain(hostname) {
  var parts = hostname.split('.');
  if (parts.length > 2) {
    return parts.slice(parts.length - 2).join('.');
  } else {
    return hostname;
  }
}

