var form = document.getElementById('form');
var domainsInput = document.getElementById('domains');

chrome.storage.sync.get('domains', function(result) {
  if (result.domains) {
    domainsInput.value = result.domains.join(', ');
  }
});

form.addEventListener('submit', function(event) {
  event.preventDefault();
  var domains = domainsInput.value.split(',').map(function(domain) {
    return domain.trim();
  });
  chrome.storage.sync.set({domains: domains}, function() {
    alert('已保存需要检测的网站列表');
  });
});

