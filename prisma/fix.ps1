with open('schema.prisma', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output = []
i = 0
while i < len(lines):
    if 'datasource db {' in lines[i]:
        output.append('datasource db {\n')
        output.append('  url      = env(\ DATABASE_URL\)\n')
        rest = lines[i].split('{', 1)[1]
        output.append(f'  {rest.strip()}\n')
        output.append('}\n')
        while i < len(lines) and lines[i].strip() not in ['', 'model']:
            i += 1
        continue
    output.append(lines[i])
    i += 1

with open('schema.prisma', 'w', encoding='utf-8') as f:
    f.writelines(output)

print('Schema fixed successfully')
