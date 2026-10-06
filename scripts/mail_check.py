import imaplib, email, os, re, sys
env = dict(l.strip().split('=',1) for l in open(os.path.expanduser('~/.config/swarm/secrets.env')) if '=' in l and not l.startswith('#'))
addr = env['BRAND_GMAIL_ADDRESS'].strip('"\''); pw = env['BRAND_GMAIL_APP_PASSWORD'].strip('"\'').replace(' ','')
M = imaplib.IMAP4_SSL('imap.gmail.com', 993); M.login(addr, pw); M.select('INBOX', readonly=True)
q = sys.argv[1] if len(sys.argv)>1 else 'perpledger'
typ, data = M.search(None, '(TO "%s")' % q) if '@' in q else M.search(None, 'X-GM-RAW', '"to:%s"' % q)
ids = data[0].split()[-int(sys.argv[2] if len(sys.argv)>2 else 10):]
for i in ids:
    typ, d = M.fetch(i, '(RFC822)'); m = email.message_from_bytes(d[0][1])
    body = ''
    for p in m.walk():
        if p.get_content_type() == 'text/plain':
            body = p.get_payload(decode=True).decode(errors='ignore'); break
    print('---', m['Date'], '|', m['From'], '|', m['To'], '|', m['Subject']); print(body[:1500])
