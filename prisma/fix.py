with open("schema.prisma", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if "datasource db {" in line:
        new_lines.append("datasource db {\n")
        new_lines.append(
url
=
env
DATABASE_URL
\n)
        new_lines.append("  provider = \"postgresql\"\n")
        new_lines.append("}\n")
        skip = True
    elif skip and line.strip() and line.strip() != "}":
        continue
    elif skip and line.strip() == "}":
        skip = False
        new_lines.append(line)
    else:
        new_lines.append(line)

with open("schema.prisma", "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Fixed")

