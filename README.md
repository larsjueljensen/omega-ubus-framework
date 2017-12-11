# omega-ubus-framework

A thin "framework" layer on top of the Onion Omega2 uBus api (also known as Omega2 cloud api).
It only consists of one file which basically sets up the following structure:

```javascript
omega = {
  session: {
        create (timeout) { ... }
        list () { ... }
        grant (scope, objects) { ... }
        revoke (scope, objects) { ... }
        access (scope, object, func) { ... }
        set (values) { ... }
        get (keys) { ... }
        unset (keys) { ... }
        destroy () { ... }
        login (username, password, timeout) { ... }
  },
  file: {
        read (path, base64 = false) { ... }
        write (path, data, append, mode, base64 = false) { ... }
        list (path) { ... }
        stat (path) { ... }
        md5 (path, base64 = false) { ... }
        exec (command, params, env = '') { ... }
  },
  system: {
        board () { ... }
        info () { ... }
        signal (pid, signum) { ... }
  },
  uci: {
        config () { ... }
        get (config, section, option, type, match) { ... }
        add (config, type, name, values) { ... }
        set (config, section, type, option, values) { ... }
        delete (config, section, type, match, option, options) { ... }
        rename (config, section, option, name) { ... }
        revert (config) { ... }
        commit (config) { ... }
  },
  i2c: {
        scan () { ... },
        pwm: {
                init () { ... }
                sleep () { ... }
                set (channel, duty, frequency, delay) { ... }
                setPeriod (channel, pulse, period) { ... }
        },
        relay: {
                set (channel, state, address) { ... }
                get (channel, address) { ... }
        },
        oled: {
                init () { ... }
                clear () { ... }
                power (state) { ... }
                invert (state) { ... }
                dim (state) { ... }
                cursor (row, col) { ... }
                write (message) { ... }
                scroll (direction) { ... }
                draw (path) { ... }
        }
  },
  onion: {
        wifiScan () { ... },
        oupgrade: {
                version () { ... }
                check () { ... }
                latest () { ... }
                force () { ... }
        },
        omegaled: {
                readTriggers () { ... }
                setTrigger (mode) { ... }
        },
        gpio: {
                status (pin) { ... }
                getDirection (pin) { ... }
                setDirection (pin, direction) { ... }
                get (pin) { ... }
                set (pin, value) { ... }
        },
        rgbled: {
                set (color) { ... }
        }
  }
}
```

* More information about the Omega2 can be found at https://onion.io/omega2/
* Documentation for the OpenWRT uBus architecture can be found at https://wiki.openwrt.org/doc/techref/ubus
* Reference documentation for the Omega2 cloud API can be found at https://sdk.onion.io/reference/onion-cloud-APIs/device-api.html#
