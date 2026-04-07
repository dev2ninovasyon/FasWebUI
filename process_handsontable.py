import re
import os
import sys

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Determine if this is a vanilla Handsontable file or HotTable React file
    is_vanilla = bool(re.search(r'new Handsontable\(', content))
    is_react = bool(re.search(r'<HotTable\b', content))

    # ==================================================================
    # 1. Update theme prop in HotTable (React component)
    # ==================================================================
    if is_react:
        content = re.sub(
            r'theme="horizon"',
            'theme={customizer.activeMode === "dark" ? "horizon-dark" : "horizon"}',
            content
        )

    # ==================================================================
    # 2. Update theme in vanilla Handsontable
    # ==================================================================
    if is_vanilla:
        content = re.sub(
            r"theme:\s*'ht-theme-horizon'",
            "theme: customizer.activeMode === \"dark\" ? 'ht-theme-horizon-dark' : 'ht-theme-horizon'",
            content
        )

    # ==================================================================
    # 3. Remove afterGetColHeader prop usage from HotTable JSX / vanilla
    # ==================================================================
    content = re.sub(
        r'\s*afterGetColHeader=\{afterGetColHeader\}',
        '',
        content
    )
    # Also remove from vanilla JS settings
    content = re.sub(
        r',?\s*afterGetColHeader:\s*afterGetColHeader,?\s*\n?',
        '\n',
        content
    )

    # ==================================================================
    # 4. Remove afterGetRowHeader prop usage from HotTable JSX / vanilla
    # ==================================================================
    content = re.sub(
        r'\s*afterGetRowHeader=\{afterGetRowHeader\}',
        '',
        content
    )
    # Also remove from vanilla JS settings
    content = re.sub(
        r',?\s*afterGetRowHeader:\s*afterGetRowHeader,?\s*\n?',
        '\n',
        content
    )

    # ==================================================================
    # 5 & 6. Remove afterGetColHeader and afterGetRowHeader function definitions
    # ==================================================================
    def remove_function_def(text, func_name):
        pattern = r'[ \t]*const ' + re.escape(func_name) + r'\s*=\s*\('
        match = re.search(pattern, text)
        if not match:
            return text

        start = match.start()
        pos = match.end()
        # Find the => {
        arrow_match = re.search(r'=>\s*\{', text[pos:])
        if not arrow_match:
            return text
        brace_start = pos + arrow_match.end() - 1

        # Count braces to find matching close
        depth = 0
        i = brace_start
        while i < len(text):
            if text[i] == '{':
                depth += 1
            elif text[i] == '}':
                depth -= 1
                if depth == 0:
                    end = i + 1
                    # Consume optional semicolon and ONE newline
                    if end < len(text) and text[end] == ';':
                        end += 1
                    if end < len(text) and text[end] == '\r':
                        end += 1
                    if end < len(text) and text[end] == '\n':
                        end += 1
                    return text[:start] + text[end:]
            i += 1
        return text

    content = remove_function_def(content, 'afterGetColHeader')
    content = remove_function_def(content, 'afterGetRowHeader')

    # ==================================================================
    # 7. In afterRenderer functions, remove only pure styling lines
    # ==================================================================
    styling_patterns = [
        r'[ \t]*TD\.style\.fontFamily\s*=\s*[^;]+;\n?',
        r'[ \t]*TD\.style\.fontWeight\s*=\s*[^;]+;\n?',
        r'[ \t]*TD\.style\.fontSize\s*=\s*[^;]+;\n?',
        r'[ \t]*TD\.style\.lineHeight\s*=\s*[^;]+;\n?',
    ]
    for pattern in styling_patterns:
        content = re.sub(pattern, '', content)

    # Remove standalone styling comments
    content = re.sub(r'[ \t]*//typography body1\s*\n', '', content)
    content = re.sub(r'[ \t]*//color\s*\n', '', content)

    # ==================================================================
    # 8. Check if afterRenderer is empty - if so, remove function + prop
    # ==================================================================
    def get_afterrenderer_body(text, func_name='afterRenderer'):
        pattern = r'[ \t]*const ' + re.escape(func_name) + r'\s*=\s*\('
        match = re.search(pattern, text)
        if not match:
            return None, None, None

        start = match.start()
        pos = match.end()
        arrow_match = re.search(r'=>\s*\{', text[pos:])
        if not arrow_match:
            return None, None, None
        brace_start = pos + arrow_match.end() - 1

        depth = 0
        i = brace_start
        body_start = brace_start + 1
        while i < len(text):
            if text[i] == '{':
                depth += 1
            elif text[i] == '}':
                depth -= 1
                if depth == 0:
                    body = text[body_start:i]
                    end = i + 1
                    if end < len(text) and text[end] == ';':
                        end += 1
                    if end < len(text) and text[end] == '\r':
                        end += 1
                    if end < len(text) and text[end] == '\n':
                        end += 1
                    return start, end, body
            i += 1
        return None, None, None

    def is_body_empty(body):
        clean = body
        clean = re.sub(r'//[^\n]*', '', clean)  # remove line comments
        clean = re.sub(r'TD\.style\.whiteSpace[^;]*;', '', clean)
        clean = re.sub(r'TD\.style\.overflow[^;]*;', '', clean)
        clean = re.sub(r'\s+', '', clean)
        return clean == ''

    # Check main afterRenderer
    start, end, body = get_afterrenderer_body(content, 'afterRenderer')
    if start is not None and body is not None and is_body_empty(body):
        content = content[:start] + content[end:]
        # Remove prop from JSX
        content = re.sub(r'\s*afterRenderer=\{afterRenderer\}', '', content)
        # Remove from vanilla Handsontable settings
        content = re.sub(r',?\s*afterRenderer:\s*afterRenderer,?\s*\n?', '\n', content)

    # ==================================================================
    # 9. Remove unused 'plus' import
    # ==================================================================
    plus_uses = [m.start() for m in re.finditer(r'\bplus\b', content)]
    if len(plus_uses) <= 1:
        content = re.sub(
            r'import \{ plus \} from "@/utils/theme/Typography";\s*\n?',
            '',
            content
        )

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Collect all tsx files using HotTable or new Handsontable
base_dir = r'C:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI\src'
files = []
for root, dirs, filenames in os.walk(base_dir):
    for fn in filenames:
        if fn.endswith('.tsx'):
            fp = os.path.join(root, fn)
            try:
                with open(fp, 'r', encoding='utf-8') as f:
                    c = f.read()
                if 'HotTable' in c or 'new Handsontable(' in c:
                    files.append(fp)
            except:
                pass

print(f"Found {len(files)} files to process")

changed = 0
errors = []
for filepath in files:
    try:
        if process_file(filepath):
            changed += 1
            print(f"Changed: {os.path.basename(filepath)}")
    except Exception as e:
        errors.append((filepath, str(e)))
        print(f"ERROR {os.path.basename(filepath)}: {e}")

print(f"\nTotal changed: {changed}/{len(files)}")
if errors:
    print("\nErrors:")
    for f, e in errors:
        print(f"  {f}: {e}")
