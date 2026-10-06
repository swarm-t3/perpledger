"""Minimal Reddit API client (OAuth "script" app, password grant). Never prints secrets.
Usage:
  python3 scripts/reddit.py rules CryptoTax
  python3 scripts/reddit.py submit CryptoTax "<title>" <body_file>
  python3 scripts/reddit.py comments <post_id36>
Env (from ~/.config/swarm/secrets.env, names may differ: adjust KEYS below):
  REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD
"""
import json, os, sys, urllib.request, urllib.parse, base64

KEYS = ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_USERNAME', 'REDDIT_PASSWORD']
UA = 'script:txsqueeze-poster:0.1 (by /u/{})'

def env():
    vals = dict(os.environ)
    p = os.path.expanduser('~/.config/swarm/secrets.env')
    if os.path.exists(p):
        for line in open(p):
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                vals.setdefault(k.replace('export ', '').strip(), v.strip().strip('"\''))
    missing = [k for k in KEYS if k not in vals]
    if missing:
        sys.exit('missing env: ' + ', '.join(missing))
    return vals

def token(e):
    auth = base64.b64encode(f"{e['REDDIT_CLIENT_ID']}:{e['REDDIT_CLIENT_SECRET']}".encode()).decode()
    data = urllib.parse.urlencode({'grant_type': 'password', 'username': e['REDDIT_USERNAME'], 'password': e['REDDIT_PASSWORD']}).encode()
    req = urllib.request.Request('https://www.reddit.com/api/v1/access_token', data=data, headers={'Authorization': 'Basic ' + auth, 'User-Agent': UA.format(e['REDDIT_USERNAME'])})
    return json.load(urllib.request.urlopen(req))['access_token']

def api(e, tok, method, path, params=None):
    url = 'https://oauth.reddit.com' + path
    data = None
    if method == 'GET' and params:
        url += '?' + urllib.parse.urlencode(params)
    elif params:
        data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(url, data=data, method=method, headers={'Authorization': 'bearer ' + tok, 'User-Agent': UA.format(e['REDDIT_USERNAME'])})
    return json.load(urllib.request.urlopen(req))

if __name__ == '__main__':
    e = env(); tok = token(e); cmd = sys.argv[1]
    if cmd == 'rules':
        r = api(e, tok, 'GET', f'/r/{sys.argv[2]}/about/rules')
        for x in r.get('rules', []):
            print('-', x['short_name'], '|', x.get('description', '')[:300].replace('\n', ' '))
    elif cmd == 'submit':
        body = open(sys.argv[4]).read()
        r = api(e, tok, 'POST', '/api/submit', {'sr': sys.argv[2], 'kind': 'self', 'title': sys.argv[3], 'text': body, 'api_type': 'json'})
        print(json.dumps(r.get('json', r))[:500])
    elif cmd == 'comments':
        r = api(e, tok, 'GET', f'/comments/{sys.argv[2]}', {'limit': 100})
        post = r[0]['data']['children'][0]['data']
        print(post['title'], post['score'], post['num_comments'], 'https://reddit.com' + post['permalink'])
        def walk(cs, d=0):
            for c in cs:
                if c['kind'] != 't1': continue
                x = c['data']; print('  ' * d + '-', x['author'], x['score'], x['body'][:300].replace('\n', ' '))
                if x.get('replies'): walk(x['replies']['data']['children'], d + 1)
        walk(r[1]['data']['children'])
