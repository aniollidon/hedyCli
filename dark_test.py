class Testing:
    def __init__(self):
        self.inputs = []
        self.index = 0
        self.outputs = []

    def init_input(self, inputs):
        self.inputs = inputs
        self.index = 0

    def c_input(self, question):
        self.c_print(question)

        if self.index >= len(self.inputs):
            response = "blablabla"
        else:
            response = self.inputs[self.index]
            self.index += 1

        return response

    def c_print(self, output):
        self.outputs.append(output)

    def output_string(self, separator=None):
        if separator:
            return str(separator).join(self.outputs)
        else:
            return "\n".join(self.outputs)


def testing_execute_hedy_str(hedy_code, level, inputs=None):
    testing = Testing()
    if inputs:
        testing.init_input(inputs)
    response = execute_hedy(hedy_code, level, testing)

    if 'Error' in response:
        return "!!Error en l'execució de l'Hedy, error de \"" + response["Error"] + "\" a la " + \
            location_to_line_column(response["Location"]) + "!!"
    elif 'Warning' in response:
        return testing.output_string() + "\n!!" + "Warning d'Hedy: \"" + response["Warning"] + "\" a la " + \
            location_to_line_column(response["Location"]) + "!!"

    return testing.output_string()


def hedy_testing(hedy_code, test_object):
    level = int(test_object['level'])
    tests_passed = 0
    total_tests = 0
    test_results = []
    tests_failed = []

    # Esborra els comentaris de hedy_code en cas que n'hi hagi
    hedy_code = re.sub(r'#.*', '', hedy_code)

    if 'tests' in test_object:
        total_tests += len(test_object['tests'])
        for t in test_object['tests']:
            testing = Testing()
            input_test = None
            test_description = "Execució del programa"
            test_results.append({"description": test_description, "inputs": None,
                                 "result": "success"})
            if 'inputs' in t:
                testing.init_input(t['inputs'])
                test_description = "Comparació amb entrada determinada"
                test_results[-1]["inputs"] = t['inputs']
                test_results[-1]["description"] = test_description

            response = execute_hedy(hedy_code, level, testing)

            if 'Error' in response:
                tests_failed.append({
                    "description": test_description,
                    "inputs": t['inputs'] if 'inputs' in t else None,
                    "type": "execution_error",
                    "error": "Error en l'execució de l'Hedy",
                    "details": "Error de \"" + response["Error"] + "\" a la " +
                               location_to_line_column(response["Location"])
                })
                test_results[-1]["result"] = "execution_error"
                break
            elif 'Warning' in response:
                tests_failed.append({
                    "description": test_description,
                    "inputs": t['inputs'] if 'inputs' in t else None,
                    "type": "execution_warning",
                    "error": "Warning en l'execució de l'Hedy",
                    "details": "Warning de \"" + response["Warning"] + "\" a la " +
                               location_to_line_column(response["Location"])
                })
                test_results[-1]["result"] = "execution_warning"

            if 'output' in t:
                test_results[-1]["output"] = t['output']

                regularcheck = False

                # si hi ha alguna clau a test_results[-1] que començi amb @
                # vol dir que és una expressió regular
                for key in t:
                    if key[0] == "@":
                        regularcheck = True
                        break

                if regularcheck:
                    check = validar_random(testing.output_string(), t)
                else:
                    check = testing.output_string() == t['output']

                if check:
                    tests_passed += 1
                else:
                    tests_failed.append({
                        "description": test_description,
                        "type": "output_error",
                        "inputs": t['inputs'] if 'inputs' in t else None,
                        "error": "La sortida no és la que s'esperava",
                        "desired": t['output'],
                        "received": testing.output_string()
                    })
                    test_results[-1]["result"] = "failed"

    if 'expected' in test_object:
        total_tests += len(test_object['expected'])
        for expected in test_object['expected']:
            test_description = "Cerca &quot;" + expected['word'] + "&quot;"
            test_results.append({"description": test_description, "result": "success"})
            if 'count' in expected:
                if hedy_code.count(expected['word']) == expected['count']:
                    tests_passed += 1
                else:
                    tests_failed.append({
                        "description": test_description,
                        "type": "count_error",
                        "error": "S'esperava trobar &quot;" + expected['word'] + "&quot; " + str(expected['count']) +
                                 " vegades però s'ha trobat " + str(hedy_code.count(expected['word'])) + " vegades",
                        "expected": expected['count'],
                        "found": hedy_code.count(expected['word'])
                    })
                    test_results[-1]["result"] = "failed"
            else:
                if hedy_code.find(expected['word']) != -1:
                    tests_passed += 1
                else:
                    tests_failed.append({
                        "description": test_description,
                        "type": "count_error",
                        "error": "S'esperava trobar &quot;" + expected['word'] + "&quot; i no s'ha trobat",
                        "expected": "*",
                        "found": "0"
                    })
                    test_results[-1]["result"] = "failed"

    return tests_passed, total_tests, test_results, tests_failed


def validar_random(input_text, estructura):
    regex_pattern = estructura["output"]
    variables = re.findall(r'@(\w+)', regex_pattern)

    for variable in variables:
        if "@" + variable not in estructura:
            raise ValueError(f"No s'ha trobat la definició per a la variable '{variable}' en l'estructura.")

    for variable, valors in estructura.items():
        if variable.startswith("@"):
            regex_pattern = regex_pattern.replace("@" + variable[1:], "(" + "|".join(valors) + ")")

    regex_pattern = "^" + regex_pattern + "$"
    regex = re.compile(regex_pattern)

    if regex.match(input_text):
        return True
    else:
        return False

