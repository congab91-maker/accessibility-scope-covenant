import importlib.util
import sys
import types
from pathlib import Path

import pytest


class GenericDict(dict):
    @classmethod
    def __class_getitem__(cls, _item):
        return cls


class GenericList(list):
    @classmethod
    def __class_getitem__(cls, _item):
        return cls


class Address(str):
    @property
    def as_hex(self):
        return str(self)


class Return:
    def __init__(self, calldata):
        self.calldata = calldata


class UserError(Exception):
    pass


class Decorator:
    def __call__(self, function):
        return function


class Public:
    write = Decorator()
    view = Decorator()


class Web:
    def __init__(self):
        self.pages = {}
        self.calls = []

    def render(self, url, mode="html"):
        self.calls.append((url, mode))
        value = self.pages[url]
        if isinstance(value, Exception):
            raise value
        return value


class Nondet:
    def __init__(self):
        self.web = Web()
        self.results = []
        self.prompts = []
        self.result = {
            "verdict": "SCOPE_ALIGNED",
            "product_match": True,
            "version_match": True,
            "evidence_complete": True,
            "limitation_disclosed": True,
            "material_limitation_ids": [],
            "reason": "The frozen claim matches the stated ACR scope and version.",
        }

    def exec_prompt(self, prompt, response_format=None):
        assert response_format == "json"
        self.prompts.append(prompt)
        if self.results:
            return dict(self.results.pop(0))
        return dict(self.result)


class VM:
    Return = Return
    UserError = UserError

    @staticmethod
    def run_nondet_unsafe(leader_fn, validator_fn):
        result = leader_fn()
        assert validator_fn(Return(result)) is True
        return result


class Contract:
    pass


class CodeSlot:
    def __init__(self, root, sender):
        self.root = root
        self.sender = sender
        self.value = bytearray(b"v1")

    def get(self):
        return self

    def _authorize(self):
        if self.sender() not in self.root.upgraders.get():
            raise UserError("locked Root slot")

    def truncate(self):
        self._authorize()
        self.value.clear()

    def extend(self, value):
        self._authorize()
        self.value.extend(value)


class UpgraderSlot:
    def __init__(self):
        self.value = GenericList()

    def get(self):
        return self.value


class RootState:
    def __init__(self, sender):
        self.upgraders = UpgraderSlot()
        self.code = CodeSlot(self, sender)


@pytest.fixture()
def contract_module():
    genlayer = types.ModuleType("genlayer")
    gl = types.SimpleNamespace(
        Contract=Contract,
        public=Public(),
        vm=VM(),
        nondet=Nondet(),
        message=types.SimpleNamespace(
            sender_address=Address("0x1111111111111111111111111111111111111111")
        ),
        message_raw={"datetime": "2026-08-13T00:00:00+00:00"},
    )
    root_state = RootState(lambda: gl.message.sender_address)
    gl.storage = types.SimpleNamespace(
        Root=types.SimpleNamespace(get=lambda: root_state)
    )
    gl._root_state = root_state
    genlayer.gl = gl
    genlayer.TreeMap = GenericDict
    genlayer.DynArray = GenericList
    genlayer.Address = Address
    genlayer.u256 = int
    genlayer.u8 = int
    genlayer.__all__ = ["gl", "TreeMap", "DynArray", "Address", "u256", "u8"]
    sys.modules["genlayer"] = genlayer

    contract_path = (
        Path(__file__).parents[1] / "contracts" / "accessibility_scope_covenant.py"
    )
    spec = importlib.util.spec_from_file_location("accessibility_scope_contract", contract_path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    yield module
    sys.modules.pop("accessibility_scope_contract", None)
    sys.modules.pop("genlayer", None)


@pytest.fixture()
def covenant(contract_module):
    instance = contract_module.AccessibilityScopeCovenant()
    instance.profiles = GenericDict()
    instance.profile_owners = GenericDict()
    instance.client_profiles = GenericDict()
    instance.evidence_counts = GenericDict()
    instance.evidence_records = GenericDict()
    instance.assessments = GenericDict()
    instance.__init__()
    return instance
