document.addEventListener('DOMContentLoaded', () => {

var form = document.getElementById('form');
var domainsInput = document.getElementById('targetSiteUrls');

chrome.storage.sync.get('domains', function(result) {
  if (result.domains) {
    domainsInput.value = result.domains.join('\n');
  }
});

document.getElementById('saveButton').addEventListener('click', function(event) {
  event.preventDefault();
  var domains = domainsInput.value.split('\n').map(function(domain) {
    return domain.trim();
  });
  console.log(domains);
  chrome.storage.sync.set({domains: domains}, function() {
    alert('已保存需要检测的网站列表');
  });
});

});
