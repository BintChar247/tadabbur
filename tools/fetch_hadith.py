import sqlite3, json, sys
c=sqlite3.connect('/home/claude/hd/np/node_modules/hadith/data/hadith.db')
COL={'B':'Sahih al-Bukhari','M':'Sahih Muslim','T':'Jami` at-Tirmidhi','D':'Sunan Abi Dawud','N':"Sunan an-Nasa'i",'I':'Sunan Ibn Majah'}
def get(ref):
  k,num=ref.split(':',1)
  rows=[]
  for n in (num, num+' a'):
    rows=rows or c.execute("select c0,c3,c4,c5,c7,c8 from hadith_en_content where c8 like ?",(f"{COL[k]}, {n}\n%",)).fetchall()
  if not rows: rows=c.execute("select c0,c3,c4,c5,c7,c8 from hadith_en_content where c8 = ?",(f"{COL[k]}, {num}",)).fetchall()
  out=[]
  for aurn,pre,txt,post,grade,refs in rows:
    a=c.execute("select c6,c7,c8 from hadith_content where c0=?",(int(aurn),)).fetchone()
    out.append(dict(ref=refs.split('\n')[0],grade=grade.strip(),pre=pre,en=txt,post=post,ar=(a[1] if a else '')))
  return out
if __name__=='__main__':
  for ref in sys.argv[1:]:
    for h in get(ref): print('##',ref,'|',h['ref'],'|',h['grade'],'|',h['pre'][:80],'|',h['en'][:260].replace('\n',' '),'| ARlen',len(h['ar']),'ENlen',len(h['en']))
    if not get(ref): print('##',ref,'NOT FOUND')
