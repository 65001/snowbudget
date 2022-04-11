# Simple python file that defines configurations for the flask server.
#
#   Connor Shugg

import os
import json

# Main config class.
class Config:
    def __init__(self, fpath):
        self.fpath = fpath

        # open up the file and try to parse it as JSON
        fp = open(fpath, "r")
        data = fp.read()
        fp.close()
        jdata = json.loads(data)

        # now, define and check all fields
        expected = [
            # server-related configs
            ["server_addr", str, "missing server_addr string"],
            ["server_port", int, "missing server_port int"],
            ["server_root_dpath", str, "missing server_root_dpath string"],
            ["server_home_fname", str, "missing server_home_fname string"],
            ["server_home_auth_fname", str, "missing server_home_auth_fname string"],
            ["server_public_files", list, "missing server_public_files list"],
            # budget-related configs
            ["sb_config_fpath", str, "missing sb_config_fpath string"],
            # key-related configs
            ["key_dpath", str, "missing key_dpath string"],
            ["auth_key_fname", str, "missing auth_key_fname string"],
            ["auth_jwt_key_fname", str, "missing auth_jwt_key_fname string"],
            ["auth_special_user_fname", str, "missing auth_special_user_fname string"],
            # certs/HTTPS-related configs
            ["certs_enabled", bool, "missing certs_enabled boolean"],
            ["certs_dpath", str, "missing certs_dpath string"],
            ["certs_cert_fname", str, "missing certs_cert_fname string"],
            ["certs_key_fname", str, "missing certs_key_fname string"]
        ]

        # for each expected entry, assert its existence then set it as a global
        for f in expected:
            key = f[0]
            assert key in jdata and type(jdata[key]) == f[1], f[2]
            setattr(self, key, jdata[key])

