window.omega = (function () {

    'use strict';

    function callWithoutResponse(command) {
        fetch('/ubus', {
            method: "POST",
            body: JSON.stringify(command)
        });
    }

    function call(command) {

        return fetch('/ubus', {
            method: "POST",
            body: JSON.stringify(command)
        })
            .then(response => response.json())
            .then(function (rpcResponse) {

                console.log('rpcResponse', rpcResponse);

                if (rpcResponse.result[0] === 0) {
                    return rpcResponse.result[1];
                }

                if (rpcResponse.result[0]) {
                    throw new Error('Omega responded with error code ' + rpcResponse.result[0]);
                }

                if (rpcResponse.error) {
                    throw new Error('Omega failed with error ' + rpcResponse.error);
                }
            })
            .catch(function (error) { throw new Error('Unable to perform rpc call to Omega. ' + error); })
    }

    let uBusSession = (function () {

        let _id = 1;
        let _session = "00000000000000000000000000000000";

        return {
            get id() {
                let result = _id;
                _id = _id + 1;
                return result;
            },

            get session() {
                return _session;
            },

            set session(session) {
                _session = session;
            }
        }
    }());

    class uBusCommand {
        constructor() {
            this.jsonrpc = "2.0";
            this.id = uBusSession.id;
            this.method = "call";
        }
    }

    class SessionCommand extends uBusCommand {
        constructor(command, params) {
            super();
            this.params = [
                uBusSession.session,
                "session",
                command,
                params
            ];
        }
    }

    class SessionService {
        create (timeout) { return call(new SessionCommand("create", {timeout: timeout})); }
        list () { return call(new SessionCommand("list", {})); }
        grant (scope, objects) { return call(new SessionCommand("grant", {scope: scope, objects: objects})); }
        revoke (scope, objects) { return call(new SessionCommand("revoke", {scope: scope, objects: objects})); }
        access (scope, object, func) { return call(new SessionCommand("access", {scope: scope, object: object, function: func})); }
        set (values) { return call(new SessionCommand("set", {values: values})); }
        get (keys) { return call(new SessionCommand("get", {keys: keys})); }
        unset (keys) { return call(new SessionCommand("unset", {keys: keys})); }
        destroy () { return call(new SessionCommand("destroy", {})); }
        login (username, password, timeout) {
            return call(new SessionCommand("login", {username: username, password: password, timeout: timeout}))
                .then(function (response) {
                    uBusSession.session = response['ubus_rpc_session'];
                    return response;
                });
        }
    }

    class FileCommand extends uBusCommand {
        constructor(command, params) {
            super();
            this.params = [
                uBusSession.session,
                "file",
                command,
                params
            ];
        }
    }

    class FileService {
        read (path, base64 = false) { return call(new FileCommand("read", {path: path, base64: base64})); }
        write (path, data, append, mode, base64 = false) { callWithoutResponse(new FileCommand("write", {path: path, data: data, append: append, mode: mode, base64: base64})); }
        list (path) { return call(new FileCommand("list", {path: path})); }
        stat (path) { return call(new FileCommand("stat", {path: path})); }
        md5 (path, base64 = false) { return call(new FileCommand("md5", {path: path, base64: base64})); }
        exec (command, params, env = '') { return call(new FileCommand("exec", {command: command, params: params, env: env})); }
    }

    class SystemCommand extends uBusCommand {
        constructor(command, params) {
            super();
            this.params = [
                uBusSession.session,
                "system",
                command,
                params
            ];
        }
    }

    class SystemService {
        board () { return call(new SystemCommand('board', {})); }
        info () { return call(new SystemCommand('info', {})); }
        signal (pid, signum) { return call(new SystemCommand('signal', {pid: pid, signum: signum})); }
    }

    class UciCommand extends uBusCommand {
        constructor(command, params) {
            super();
            this.params = [
                uBusSession.session,
                "uci",
                command
            ];
            if (params) {
                this.params.push(params);
            }
        }
    }

    class UciService {
        config () { return call(new UciCommand('config')); }
        get (config, section, option, type, match) { return call(new UciCommand('get', {config: config, section: section, option: option, type: type, match: match})); }
        add (config, type, name, values) { return call(new UciCommand('add', {config: config, type: type, name: name, values: values})); }
        set (config, section, type, option, values) { return call(new UciCommand('set', {config: config, section: section, type: type, option: option, values: values})); }
        delete (config, section, type, match, option, options) { return call(new UciCommand('delete', {config: config, section: section, type: type, match: match, option: option, options: options})); }
        rename (config, section, option, name) { return call(new UciCommand('rename', {config: config, section: section, option: option, name: name})); }
        revert (config) { return call(new UciCommand('revert', {config: config})); }
        commit (config) { callWithoutResponse(new UciCommand('commit', {config: config})); }
    }

    class i2cCommand extends uBusCommand {
        constructor(service, command, options, params) {
            super();
            this.params = [
                uBusSession.session,
                "i2c_exp",
                service,
                {
                    command: command,
                    options: options,
                    params: params
                }
            ];
        }
    }

    class PwmCommand extends i2cCommand {
        constructor(command, params) {
            super('pwm-exp', command, undefined, params);
        }
    }

    class PwmService {
        init () { return call(new PwmCommand('init', {})); }
        sleep () { return call(new PwmCommand('sleep', {})); }
        set (channel, duty, frequency, delay) { return call(new PwmCommand('set', {channel: channel, duty: duty, frequency: frequency, delay: delay})); }
        setPeriod (channel, pulse, period) { return call(new PwmCommand('set-period', {channel: channel, pulse: pulse, period: period})); }

    }

    class RelayCommand extends i2cCommand {
        constructor(command, params) {
            super('relay-exp', command, undefined, params);
        }
    }

    class RelayService {
        set (channel, state, address) { return call(new RelayCommand('set', {channel: channel, state: state, address: address})); }
        get (channel, address) { return call(new RelayCommand('get', {channel: channel, address: address})); }
    }

    class OledCommand extends i2Command {
        constructor(options, params) {
            super('oled-exp', 'set', options, params);
        }
    }

    class OledService {
        init () { return call(new OledCommand('i')); }
        clear () { return call(new OledCommand('c')); }
        power (state) { return call(new OledCommand(undefined, {power: state})); }
        invert (state) { return call(new OledCommand(undefined, {invert: state})); }
        dim (state) { return call(new OledCommand(undefined, {dim: state})); }
        cursor (row, col) { return call(new OledCommand(undefined, {cursor: String(row + ',' + col)})); }
        write (message) { return call(new OledCommand(undefined, {write: message})); }
        scroll (direction) { return call(new OledCommand(undefined, {scroll: direction})); }
        draw (path) { return call(new OledCommand(undefined, {draw: path})); }
    }

    class OnionCommand extends uBusCommand {
        constructor(command, params) {
            super();
            this.params = [
                uBusSession.session,
                'onion',
                command,
                params
            ];
        }
    }

    class WifiScanCommand extends OnionCommand {
        constructor(device) {
            super('wifi-scan', {device: device});
        }
    }

    class OupgradeCommand extends OnionCommand {
        constructor(command) {
            super('oupgrade', {params: (function (command) {let result = {}; result[command] = ''; return result;}(command))});
        }
    }

    class OupgradeService {
        version () { return call(new OupgradeCommand('version')); }
        check () { return call(new OupgradeCommand('check')); }
        latest () { return call(new OupgradeCommand('latest')); }
        force () { return call(new OupgradeCommand('force')); }
    }

    class OmegaLedCommand extends OnionCommand {
        constructor(params) {
            super('omega-led', params);
        }
    }

    class OmegaLedService {
        readTriggers () { return call(new OmegaLedCommand({read_triggers: true})); }
        setTrigger (mode) { return call(new OmegaLedCommand({set_trigger: mode})); }
    }

    class GpioCommand extends OnionCommand {
        constructor(command, params) {
            super('gpio', {command: command, params: params});
        }
    }

    class GpioService {
        status (pin) { return call(new GpioCommand('status', {gpio: String(pin)})); }
        getDirection (pin) { return call(new GpioCommand('get-direction', {gpio: String(pin)})); }
        setDirection (pin, direction) { return call(new GpioCommand('set-direction', {gpio: String(pin), value: direction})); }
        get (pin) { return call(new GpioCommand('get', {gpio: String(ping)})); }
        set (pin, value) { return call(new GpioCommand('set', {gpio: String(pin), value: value})); }
    }

    class RgbLedCommand extends OnionCommand {
        constructor(command, params) {
            super('rgb-led', {command: command, params: params});
        }
    }

    class RgbLedService {
        set (color) { return call(new RgbLedCommand("set", {color: color})); }
    }

    return {
        session: new SessionService(),
        file: new FileService(),
        system: new SystemService(),
        uci: new UciService(),
        i2c: {
            scan () { return call(new OnionCommand('i2c-scan', {})); },
            pwm: new PwmService(),
            relay: new RelayService(),
            oled: new OledService()
        },
        onion: {
            wifiScan (device) { return call(new WifiScanCommand(device)); },
            oupgrade: new OupgradeService(),
            omegaled: new OmegaLedService(),
            gpio: new GpioService(),
            rgbled: new RgbLedService()
        }

    };

}());
