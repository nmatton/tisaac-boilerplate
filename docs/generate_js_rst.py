import re
from pathlib import Path

SKIP_FUNCTIONS = ['constructor', 'define', 'destroy', 'render', 'for', 'parse', 'isVisible', 'fetchNextUrl', 'addPrimaryActionButton', 'getValue', 'setValue', 'toValue', 'goTo', 'incValue', 'makeCounterProgress']

def extract_functions(js_file_path):
    """Extract all function names from the given JavaScript file."""
    function_regex = re.compile(r'(\w+)\s*\(.*?\)\s*{')
    function_names = []

    with open(js_file_path, 'r') as file:
        for line in file:
            match = function_regex.search(line)
            if match:
                function_names.append(match.group(1))

    return function_names

def generate_rst_file(js_file_path, output_dir):
    """Generate an .rst file with js:autofunction directives for all functions found."""
    js_file = Path(js_file_path)
    output_file = output_dir / f'{js_file.stem}.rst'

    function_names = extract_functions(js_file_path)

    with open(output_file, 'w') as rst_file:
        for function_name in function_names:
            if function_name in SKIP_FUNCTIONS:
                continue
            rst_file.write(f".. js:autofunction:: {function_name}\n\n")

    print(f"Generated {output_file} with {len(function_names)} functions.")


# Example usage
js_file_path = "../modules/js/Core/modal.js"
output_dir = Path("api/js/Modal")
output_dir.mkdir(parents=True, exist_ok=True)

generate_rst_file(js_file_path, output_dir)
