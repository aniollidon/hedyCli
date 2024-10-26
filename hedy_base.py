import sys
import time
import json
import re
import os

sys.path.append(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'hedy_web/'))
import hedy
from prefixes.normal import *


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


def hedy_error_to_response(ex, keyword_lang='en'):
    return {
        "Error": ex.error_code,
        "Location": ex.error_location
    }


def interaction_available():
    try:
        import tkinter as tk
        root = tk.Tk()
        root.update()
        root.destroy()
        return True
    except ImportError:
        return False

def parse(code, level, lang='en', keyword_lang='en', microbit=False):
    response = {}
    transpile_result = {}
    username = None
    exception = None

    try:
        try:
            transpile_result = hedy.transpile(code, level, lang, is_debug=False, microbit=microbit)
        except hedy.exceptions.WarningException as ex:
            translated_error = ex.error_code
            if isinstance(ex, hedy.exceptions.InvalidSpaceException):
                response['Warning'] = translated_error
            elif isinstance(ex, hedy.exceptions.UnusedVariableException):
                response['Warning'] = translated_error
            else:
                response['Error'] = translated_error
            response['Location'] = ex.error_location
            transpile_result = ex.fixed_result
            exception = ex
        except hedy.exceptions.UnquotedEqualityCheckException as ex:
            response['Error'] = ex.error_code
            response['Location'] = ex.error_location
            exception = ex

    except hedy.exceptions.HedyException as ex:
        response = hedy_error_to_response(ex)
        exception = ex

    except Exception as E:
        raise E
        # print(f"error transpiling {code}")
        response["Error"] = str(E)
        exception = E

    return response, transpile_result


def execute_hedy(hedy_code, level, testing=None, interact="auto", microbit=False, donot_execute=False,
                 debug=False):
    response, transpile_result = parse(hedy_code, level, 'ca', 'en', microbit=microbit)
    pause_after_turtle = False
    foo_usage = False

    if 'Error' not in response:

        if transpile_result.has_turtle:

            if interact in ["none", "cmd"]:
                response["Error"] = "No es pot utilitzar la tortuga. Assegura't d'utilitzar un mode interactiu."
                return response
            else:
                if interact in ["auto", "full"]:
                    available = interaction_available()

                    if not available:
                        response["Error"] = "No es pot utilitzar la tortuga en aquest sistema."
                        return response
                    else:
                        import turtle as t
                        pause_after_turtle = True

        python_code = transpile_result.code

        if interact == "none" and transpile_result.has_sleep:
            python_code = python_code.replace("time.sleep", "foo")
            foo_usage = True

        if transpile_result.has_clear:
            if interact == "none":
                python_code = python_code.replace("extensions.clear", "_clear")
            else:
                python_code = python_code.replace("extensions.clear", "foo")
                foo_usage = True

        if transpile_result.has_music:
            #TODO
            pass

        if transpile_result.has_pressed:
            #TODO
            pass

        if testing:
            python_code = python_code.replace("input", "testing.c_input")
            python_code = python_code.replace("print", "testing.c_print")

        try:
            if not donot_execute:
                if debug:
                    print(">>>>>> EXECUTANT PYTHON <<<<<<")
                    print(python_code)
                    print(">>>>>> FI <<<<<<")

                exec(python_code)

                if pause_after_turtle:
                    t.mainloop()

            else:
                if foo_usage:
                    python_code = '''def foo(*args): pass\n''' + python_code
                print(python_code)

        except Exception as e:
            if debug:
                raise e
            response["Error"] = "Unexpected error"
            response["details"] = str(e)

    return response


def location_to_line_column(location):
    # Si és una llista és una posició de línes
    if isinstance(location, list):
        return "línia " + str(location[0])
    else:
        return "línia " + str(location[0]) + ", columna " + str(location[1])


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


