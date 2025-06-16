/*
------------------------------------------
获取 Cookie：打开龙湖天街小程序，进入 我的 - 签到赚珑珠 - 任务赚奖励 - 马上签到。

## 青龙面板使用说明
------------------------------------------
1. 支持手动配置账号信息，优先级高于自动获取的Cookie
2. 环境变量说明：
   - LHTJ_MANUAL_COOKIE: 手动配置的账号信息，只需要token或cookie即可
   - lhtj_data: 自动获取的Cookie信息（保留原有功能）
3. 手动配置示例：
   - 只配置token: `84cde0717db742f1bc205d8c5f78ff1b`
   - 只配置cookie: `acw_tc=276aedc917500853250508165e3d830c5f183525fbcceca50ffdddea0bd90a`
   - 多账号配置: 使用 & 符号连接多个token或cookie，如 `token1&token2&cookie3`
   - 也支持完整JSON格式: `{"token":"xxx","cookie":"xxx"}`

4. 依赖说明：
   - 脚本会自动检测并安装所需依赖（iconv-lite、got@11、tough-cookie）
   - 如果自动安装失败，请在青龙面板的依赖管理中手动添加

5. 青龙面板配置步骤：
   a. 进入青龙面板 -> 环境变量 -> 新建变量
   b. 名称填写：LHTJ_MANUAL_COOKIE
   c. 值填写：您的token或cookie（参考上面的示例）
   d. 备注填写：龙湖天街账号配置
   e. 保存后新建定时任务运行脚本

6. 获取账号信息的方法：
   a. 使用抓包工具（如Surge、Charles等）抓取龙湖天街小程序的请求
   b. 找到签到相关请求（如：/signature/clock）
   c. 从请求头中提取token值
   d. 配置到环境变量中即可

7. 命令行参数（适用于青龙面板调试）：
   a. node lhtj.js debug - 开启调试模式
   b. node lhtj.js info - 显示当前配置信息
   c. node lhtj.js convert '{"token":"xxx"}' - 将请求头转换为配置格式
   d. node lhtj.js test - 测试配置是否正确

⚠️【免责声明】
------------------------------------------
1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
*/

// 自动检测和安装依赖
const checkAndInstallDeps = async () => {
    if (!isNode()) return;
    
    console.log('🔍 检查依赖...');
    const requiredDeps = [
        { name: 'iconv-lite', version: '' },
        { name: 'got', version: '@11' },
        { name: 'tough-cookie', version: '' }
    ];
    
    let needInstall = false;
    const missingDeps = [];
    
    for (const dep of requiredDeps) {
        try {
            require(dep.name);
            console.log(`✅ 依赖 ${dep.name} 已安装`);
        } catch (e) {
            console.log(`❌ 依赖 ${dep.name} 未安装`);
            missingDeps.push(dep);
            needInstall = true;
        }
    }
    
    if (needInstall) {
        console.log('📦 开始安装缺失的依赖...');
        try {
            const { execSync } = require('child_process');
            const installCmd = missingDeps.map(dep => `${dep.name}${dep.version}`).join(' ');
            console.log(`执行: npm install ${installCmd} --save`);
            execSync(`npm install ${installCmd} --save`, { stdio: 'inherit' });
            console.log('✅ 依赖安装完成');
            
            // 验证安装结果
            let allInstalled = true;
            for (const dep of missingDeps) {
                try {
                    require(dep.name);
                    console.log(`✅ 依赖 ${dep.name} 安装成功`);
                } catch (e) {
                    console.log(`❌ 依赖 ${dep.name} 安装失败，请手动安装`);
                    allInstalled = false;
                }
            }
            
            if (!allInstalled) {
                console.log('⚠️ 部分依赖安装失败，请手动安装缺失的依赖：');
                console.log(`在青龙面板的依赖管理中添加：${missingDeps.map(dep => `${dep.name}${dep.version}`).join(', ')}`);
                console.log('或通过SSH连接执行：');
                console.log(`cd /ql/scripts && npm install ${installCmd} --save`);
                process.exit(1);
            }
        } catch (e) {
            console.log('❌ 依赖安装失败，请手动安装：');
            console.log(`在青龙面板的依赖管理中添加：${missingDeps.map(dep => `${dep.name}${dep.version}`).join(', ')}`);
            console.log('或通过SSH连接执行：');
            console.log(`cd /ql/scripts && npm install ${missingDeps.map(dep => `${dep.name}${dep.version}`).join(' ')} --save`);
            console.log(`错误详情: ${e.message}`);
            process.exit(1);
        }
    }
};

// 判断是否在Node环境
function isNode() {
    return typeof module !== 'undefined' && !!module.exports;
}

// 执行依赖检查和安装
if (isNode()) {
    (async () => {
        await checkAndInstallDeps();
    })();
}

const $ = new Env("龙湖天街");
const ckName = "lhtj_data";

// 读取手动配置的账号信息
const getManualCookies = () => {
    if (!$.isNode()) return [];
    
    const manualCookieStr = process.env.LHTJ_MANUAL_COOKIE || '';
    if (!manualCookieStr) return [];
    
    try {
        // 处理多账号情况（支持&分隔符）
        const accounts = manualCookieStr.includes('&') 
            ? manualCookieStr.split('&').map(item => item.trim())
            : [manualCookieStr];
        
        // 转换为标准格式
        const validAccounts = accounts.filter(Boolean).map(account => {
            // 如果是JSON格式，尝试解析
            let parsedAccount = account;
            try {
                if (account.startsWith('{')) {
                    parsedAccount = $.toObj(account);
                }
            } catch (e) {
                // 解析失败，保持原样
            }
            
            // 如果是字符串，判断是token还是cookie
            if (typeof parsedAccount === 'string') {
                // 简单判断是token还是cookie
                if (parsedAccount.includes('=')) {
                    // 看起来像cookie
                    return {
                        "userName": "微信用户",
                        "cookie": parsedAccount,
                        "token": parsedAccount.match(/token=([^;]+)/)?.[1] || "",
                        // 默认值
                        "x-lf-channel": "L0",
                        "x-lf-bu-code": "L00602",
                        "x-lf-dxrisk-source": "2",
                        "x-lf-dxrisk-token": "",
                        "x-lf-usertoken": parsedAccount.match(/token=([^;]+)/)?.[1] || ""
                    };
                } else {
                    // 看起来像token
                    return {
                        "userName": "微信用户",
                        "token": parsedAccount,
                        "cookie": `acw_tc=276aedc917500853250508165e3d830c5f183525fbcceca50ffdddea0bd90a`,
                        // 默认值
                        "x-lf-channel": "L0",
                        "x-lf-bu-code": "L00602",
                        "x-lf-dxrisk-source": "2",
                        "x-lf-dxrisk-token": "",
                        "x-lf-usertoken": parsedAccount
                    };
                }
            }
            
            // 如果是对象，确保有必要的默认值
            return {
                "userName": parsedAccount.userName || "微信用户",
                "token": parsedAccount.token || parsedAccount.authtoken || "",
                "cookie": parsedAccount.cookie || `acw_tc=276aedc917500853250508165e3d830c5f183525fbcceca50ffdddea0bd90a`,
                "x-lf-channel": parsedAccount["x-lf-channel"] || parsedAccount.channel || "L0",
                "x-lf-bu-code": parsedAccount["x-lf-bu-code"] || parsedAccount.bucode || "L00602",
                "x-lf-dxrisk-source": parsedAccount["x-lf-dxrisk-source"] || "2",
                "x-lf-dxrisk-token": parsedAccount["x-lf-dxrisk-token"] || "",
                "x-lf-usertoken": parsedAccount["x-lf-usertoken"] || parsedAccount.token || parsedAccount.authtoken || ""
            };
        });
        
        // 验证账号有效性
        const finalAccounts = validAccounts.filter(account => {
            return account.token || account.cookie;
        });
        
        if (finalAccounts.length > 0) {
            $.log(`✅ 成功加载 ${finalAccounts.length} 个账号配置`);
        }
        
        return finalAccounts;
    } catch (e) {
        $.log(`❌ 解析账号信息失败: ${e}`);
        return [];
    }
};

// 合并手动配置和自动获取的Cookie
const manualCookies = getManualCookies();
const autoCookies = $.toObj($.isNode() ? process.env[ckName] : $.getdata(ckName)) || [];
const userCookie = manualCookies.length > 0 ? manualCookies : autoCookies;

// 检查运行环境
const checkEnv = () => {
    try {
        // 检查是否在青龙面板环境
        const isQLPanel = $.isNode() && process.env.QL_DIR;
        if (isQLPanel) {
            $.log(`🐉 检测到运行在青龙面板环境`);
            
            // 检查依赖
            try {
                require('./sendNotify');
                $.log(`✅ 通知依赖检查正常`);
            } catch (e) {
                $.log(`⚠️ 未找到通知依赖，部分功能可能受限: ${e}`);
            }
        }
        
        // 检查账号配置
        if (userCookie.length === 0) {
            $.log(`⚠️ 未找到有效的账号配置，请检查环境变量设置`);
            if ($.isNode()) {
                $.log(`💡 提示：在青龙面板中配置 LHTJ_MANUAL_COOKIE 环境变量`);
            }
        } else {
            $.log(`✅ 已加载 ${userCookie.length} 个有效账号配置`);
        }
    } catch (e) {
        $.log(`❌ 环境检查异常: ${e}`);
    }
};

// 执行环境检查
checkEnv();

// 辅助函数：将请求头转换为配置JSON
function headerToConfig(headers) {
    try {
        if (!headers) return '{}';
        
        // 将headers对象的所有键转为小写
        const lowerCaseHeaders = {};
        Object.keys(headers).forEach(key => {
            lowerCaseHeaders[key.toLowerCase()] = headers[key];
        });
        
        // 提取需要的字段
        const config = {
            "userName": "微信用户",
            "token": lowerCaseHeaders.token || "",
            "x-lf-dxrisk-token": lowerCaseHeaders['x-lf-dxrisk-token'] || "",
            "x-lf-channel": lowerCaseHeaders['x-lf-channel'] || "",
            "x-lf-usertoken": lowerCaseHeaders['x-lf-usertoken'] || "",
            "cookie": lowerCaseHeaders.cookie || "",
            "x-lf-bu-code": lowerCaseHeaders['x-lf-bu-code'] || "",
            "x-lf-dxrisk-source": lowerCaseHeaders['x-lf-dxrisk-source'] || ""
        };
        
        return JSON.stringify(config);
    } catch (e) {
        console.log(`转换请求头失败: ${e}`);
        return '{}';
    }
}

//notify
const notify = $.isNode() ? require('./sendNotify') : '';
$.notifyMsg = []
//debug
$.is_debug = ($.isNode() ? process.env.IS_DEDUG : $.getdata('is_debug')) || 'false';
$.doFlag = { "true": "✅", "false": "⛔️" };
//------------------------------------------
const baseUrl = ""
const _headers = {}

//------------------------------------------
const fetch = async (o) => {
    try {
        if (typeof o === 'string') o = { url: o };
        if (o?.url?.startsWith("/") || o?.url?.startsWith(":")) o.url = baseUrl + o.url
        const res = await Request({ ...o, headers: o.headers || _headers, url: o.url })
        debug(res, o?.url?.replace(/\/+$/, '').substring(o?.url?.lastIndexOf('/') + 1));
        if (res?.message.match(/登录已过期|用户未登录/)) throw new Error(`用户需要去登录`);
        return res;
    } catch (e) {
        $.ckStatus = false;
        $.log(`⛔️ 请求发起失败！${e}`);
    }
}
async function main() {
    try {
        //check accounts
        if (!userCookie?.length) throw new Error("找不到可用的帐户");
        
        // 输出配置来源信息
        const configSource = manualCookies.length > 0 ? "手动配置" : "自动获取";
        $.log(`ℹ️ 当前使用的账号信息来源: ${configSource}`);
        $.log(`⚙️ 发现 ${userCookie?.length ?? 0} 个帐户\n`);
        
        let index = 0;
        //doTask of userList
        for (let user of userCookie) {
            //init of user
            $.log(`🚀 开始任务`),
                $.notifyMsg = [],
                $.ckStatus = true,
                $.title = "",
                $.avatar = "";

            // 签到
            const reward_num = await signin(user);
            if ($.ckStatus) {
                // 抽奖签到
                await lotterySignin(user)
                // 抽奖
                await lotteryClock(user)
                //查询用户信息
                const { nick_name, growth_value, level, head_portrait } = await getUserInfo(user)
                //查询珑珠
                const { balance } = await getBalance(user)
                $.avatar = head_portrait;
                $.title = `本次运行共获得${reward_num}积分`
                DoubleLog(`当前用户:${nick_name}\n成长值: ${growth_value}  等级: V${level}  珑珠: ${balance}`)
            } else {
                DoubleLog(`⛔️ 「${user.userName ?? `账号${index}`}」check ck error!`)
            }
            //notify
            await sendMsg($.notifyMsg.join("\n"));
        }
    } catch (e) {
        throw e
    }
}

//签到
async function signin(user) {
    try {
        const opts = {
            url: "https://gw2c-hw-open.longfor.com/lmarketing-task-api-mvc-prod/openapi/task/v1/signature/clock",
            headers: {
                'Host': 'gw2c-hw-open.longfor.com',
                'Connection': 'keep-alive',
                'Accept': 'application/json, text/plain, */*',
                'X-LF-Bu-Code': user['x-lf-bu-code'] || 'L00602',
                'Content-Type': 'application/json;charset=UTF-8',
                'X-LF-DXRisk-Token': user['x-lf-dxrisk-token'] || '',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'X-LF-Channel': user['x-lf-channel'] || 'L0',
                'token': user.token,
                'X-LF-UserToken': user['x-lf-usertoken'] || user.token,
                'Origin': 'https://longzhu.longfor.com',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 &MAIAWebKit_iOS_com.longfor.supera_1.14.0_202506052233_Default_3.2.4.8',
                'Referer': 'https://longzhu.longfor.com/',
                'X-GAIA-API-KEY': 'c06753f1-3e68-437d-b592-b94656ea5517',
                'X-LF-DXRisk-Source': user['x-lf-dxrisk-source'] || '2',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cookie': user.cookie
            },
            type: 'post',
            dataType: "json",
            body: {
                'activity_no': '11111111111736501868255956070000'  // 更新为最新的activity_no
            }
        }
        let res = await fetch(opts);
        const reward_num = res?.data?.is_popup == 1 ? res?.data?.reward_info[0]?.reward_num : 0
        $.log(`${$.doFlag[res?.data?.is_popup == 1]} ${res?.data?.is_popup == 1 ? '每日签到: 成功, 获得' + res?.data?.reward_info[0]?.reward_num + '分' : '每日签到: 今日已签到'}\n`);
        return reward_num
    } catch (e) {
        $.log(`⛔️ 每日签到失败！${e}\n`)
    }
}
// 抽奖签到
async function lotterySignin(user) {
    try {
        const opts = {
            url: "https://gw2c-hw-open.longfor.com/llt-gateway-prod/api/v1/activity/auth/lottery/sign",
            headers: {
                'Host': 'gw2c-hw-open.longfor.com',
                'Accept': 'application/json, text/plain, */*',
                'channel': user['x-lf-channel'] || 'L0',
                'authtoken': user.token,
                'X-LF-DXRisk-Token': user['x-lf-dxrisk-token'] || '',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'x-gaia-api-key': '2f9e3889-91d9-4684-8ff5-24d881438eaf',
                'Accept-Encoding': 'gzip, deflate, br',
                'Content-Type': 'application/json',
                'Origin': 'https://llt.longfor.com',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 &MAIAWebKit_iOS_com.longfor.supera_1.14.0_202506052233_Default_3.2.4.8',
                'Referer': 'https://llt.longfor.com/',
                'bucode': user['x-lf-bu-code'] || 'L00602',
                'X-LF-DXRisk-Source': user['x-lf-dxrisk-source'] || '2',
                'Connection': 'keep-alive',
                'Cookie': user.cookie
            },
            type: 'post',
            dataType: "json",
            body: {
                "component_no": "CS14S00348I5DW7H",
                "activity_no": "AP25P05380JXUM6X"
            }
        }
        let res = await fetch(opts);
        $.log(`${$.doFlag[res?.code == '0000']} ${res?.code == '0000' ? '抽奖签到: 成功, 获得' + res?.data?.chance + '次抽奖机会' : '抽奖签到: ' + res?.message}\n`);
    } catch (e) {
        $.log(`⛔️ 抽奖签到失败！${e}\n`)
    }
}
// 抽奖
async function lotteryClock(user) {
    try {
        const opts = {
            url: "https://gw2c-hw-open.longfor.com/llt-gateway-prod/api/v1/activity/auth/lottery/click",
            headers: {
                'Host': 'gw2c-hw-open.longfor.com',
                'Accept': 'application/json, text/plain, */*',
                'channel': user['x-lf-channel'] || 'L0',
                'authtoken': user.token,
                'X-LF-DXRisk-Token': user['x-lf-dxrisk-token'] || '',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'x-gaia-api-key': '2f9e3889-91d9-4684-8ff5-24d881438eaf',
                'Accept-Encoding': 'gzip, deflate, br',
                'Content-Type': 'application/json',
                'Origin': 'https://llt.longfor.com',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 &MAIAWebKit_iOS_com.longfor.supera_1.14.0_202506052233_Default_3.2.4.8',
                'Referer': 'https://llt.longfor.com/',
                'bucode': user['x-lf-bu-code'] || 'L00602',
                'X-LF-DXRisk-Source': user['x-lf-dxrisk-source'] || '2',
                'Connection': 'keep-alive',
                'Cookie': user.cookie
            },
            type: 'post',
            dataType: "json",
            body: {
                "component_no": "CS14S00348I5DW7H",
                "activity_no": "AP25P05380JXUM6X",
                "batch_no": ""
            }
        }
        let res = await fetch(opts);
        $.log(`${$.doFlag[res?.code == '0000']} ${res?.code == '0000' ? '抽奖成功, 获得' + (res?.data?.prize_name || res?.data?.desc) : '抽奖: ' + res?.message}\n`);
    } catch (e) {
        $.log(`⛔️ 抽奖失败！${e}\n`)
    }
}
//查询用户信息
async function getUserInfo(user) {
    try {
        const opts = {
            url: "https://longzhu-api.longfor.com/lmember-member-open-api-prod/api/member/v1/mine-info",
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.48(0x18003029) NetType/4G Language/zh_CN miniProgram/wx50282644351869da',
                'Referer': 'https://servicewechat.com/wx50282644351869da/424/page-frame.html',
                'token': user.token,
                'X-Gaia-Api-Key': 'd1eb973c-64ec-4dbe-b23b-22c8117c4e8e'
            },
            type: 'post',
            dataType: "json",
            body: {
                "channel": user['x-lf-channel'],
                "bu_code": user['x-lf-bu-code'],
                "token": user.token
            }
        }
        let res = await fetch(opts);
        let growth_value = res?.data?.growth_value || 0;
        $.log(`🎉 ${res?.code == '0000' ? '您当前成长值: ' + growth_value : res?.message}\n`);
        return res?.data
    } catch (e) {
        $.log(`⛔️ 查询用户信息失败！${e}\n`)
    }
}
//查询珑珠
async function getBalance(user) {
    try {
        const opts = {
            url: "https://longzhu-api.longfor.com/lmember-member-open-api-prod/api/member/v1/balance",
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.48(0x18003029) NetType/4G Language/zh_CN miniProgram/wx50282644351869da',
                'Referer': 'https://servicewechat.com/wx50282644351869da/424/page-frame.html',
                'token': user.token,
                'X-Gaia-Api-Key': 'd1eb973c-64ec-4dbe-b23b-22c8117c4e8e'
            },
            type: 'post',
            dataType: "json",
            body: {
                "channel": user['x-lf-channel'],
                "bu_code": user['x-lf-bu-code'],
                "token": user.token
            }
        }
        let res = await fetch(opts);
        let balance = res?.data.balance || 0;
        let expiring_lz = res?.data.expiring_lz || 0;
        $.log(`🎉 ${res?.code == '0000' ? '您当前珑珠: ' + balance + ', 即将过期: ' + expiring_lz : res?.message}\n`);
        return res?.data
    } catch (e) {
        $.log(`⛔️ 查询用户珑珠失败！${e}\n`)
    }
}
//获取Cookie
async function getCookie() {
    try {
        if ($request && $request.method === 'OPTIONS') return;

        const header = ObjectKeys2LowerCase($request.headers);
        if (!header.cookie) throw new Error("获取Cookie错误，值为空");

        const newData = {
            "userName": '微信用户',
            'x-lf-dxrisk-token': header['x-lf-dxrisk-token'],
            "x-lf-channel": header['x-lf-channel'],
            "token": header.token,
            'x-lf-usertoken': header['x-lf-usertoken'],
            "cookie": header.cookie,
            "x-lf-bu-code": header['x-lf-bu-code'],
            'x-lf-dxrisk-source': header['x-lf-dxrisk-source']
        }
        
        // 获取现有的Cookie数据
        let existingCookies = [];
        try {
            existingCookies = $.toObj($.isNode() ? process.env[ckName] : $.getdata(ckName)) || [];
        } catch (e) {
            $.log(`⚠️ 读取现有Cookie数据失败，将创建新数据: ${e}`);
        }
        
        // 更新或添加Cookie
        const index = existingCookies.findIndex(e => e.token == newData.token);
        if (index !== -1) {
            existingCookies[index] = newData;
            $.log(`✅ 更新账号 ${newData.userName || '微信用户'} 的Cookie成功`);
        } else {
            existingCookies.push(newData);
            $.log(`✅ 添加账号 ${newData.userName || '微信用户'} 的Cookie成功`);
        }
        
        // 保存Cookie数据
        if ($.isNode()) {
            // 在Node.js环境下，只能通过日志提示用户手动配置
            $.log(`🔔 请将以下内容手动添加到青龙面板的环境变量中:`);
            $.log(`变量名: ${ckName}`);
            $.log(`变量值: ${$.toStr(existingCookies)}`);
            $.log(`提示: 在青龙面板中，建议使用LHTJ_MANUAL_COOKIE变量手动配置账号信息`);
        } else {
            // 在其他环境下，直接保存到存储中
            $.setjson(existingCookies, ckName);
            $.msg($.name, `🎉获取Cookie成功!`, ``)
        }
    } catch (e) {
        $.log(`❌ 获取Cookie失败: ${e}`);
    }
}


//主程序执行入口
!(async () => {
    try {
        // 如果在Node环境中，确保依赖已安装
        if ($.isNode()) {
            try {
                // 尝试加载依赖，如果失败会在checkAndInstallDeps中处理
                require('iconv-lite');
                require('got');
                require('tough-cookie');
            } catch (e) {
                // 依赖问题已在checkAndInstallDeps中处理，这里不需要额外处理
            }
        }
        
        // 处理命令行参数（适用于青龙面板调试）
        if ($.isNode() && process.argv.length > 2) {
            const cmd = process.argv[2];
            if (cmd === 'debug') {
                // 调试模式
                $.log('🔍 进入调试模式');
                $.is_debug = 'true';
            } else if (cmd === 'info') {
                // 显示配置信息
                $.log('📋 当前配置信息:');
                $.log(`账号数量: ${userCookie.length}`);
                userCookie.forEach((user, index) => {
                    $.log(`\n账号 ${index + 1}:`);
                    $.log(`用户名: ${user.userName || '未命名'}`);
                    $.log(`Token: ${user.token ? '已配置' : '未配置'}`);
                    $.log(`Channel: ${user['x-lf-channel'] || user.channel || '未配置'}`);
                });
                return;
            } else if (cmd === 'convert' && process.argv.length > 3) {
                // 转换请求头为配置格式
                try {
                    const headerStr = process.argv[3];
                    const headers = JSON.parse(headerStr);
                    const config = headerToConfig(headers);
                    $.log('📝 转换结果 (可直接用于LHTJ_MANUAL_COOKIE):');
                    $.log(config);
                } catch (e) {
                    $.log(`❌ 转换失败: ${e}`);
                }
                return;
            } else if (cmd === 'test') {
                // 测试配置是否正确
                $.log('🧪 开始测试配置');
                if (userCookie.length === 0) {
                    $.log('❌ 未找到有效的账号配置，请先配置LHTJ_MANUAL_COOKIE环境变量');
                    return;
                }
                
                // 测试第一个账号
                const testUser = userCookie[0];
                $.log(`测试账号: ${testUser.userName || '未命名'}`);
                $.log(`Token: ${testUser.token || '未配置'}`);
                $.log(`Cookie: ${testUser.cookie ? (testUser.cookie.length > 20 ? testUser.cookie.substring(0, 20) + '...' : testUser.cookie) : '未配置'}`);
                
                // 测试用户信息接口
                try {
                    $.log('\n测试用户信息接口...');
                    const userInfo = await getUserInfo(testUser);
                    if (userInfo) {
                        $.log(`✅ 用户信息获取成功: ${userInfo.nick_name || '未知用户'}`);
                    } else {
                        $.log('❌ 用户信息获取失败');
                    }
                } catch (e) {
                    $.log(`❌ 用户信息接口异常: ${e}`);
                }
                
                return;
            }
        }
        
        if (typeof $request != "undefined") {
            await getCookie();
        } else {
            await main();
        }
    } catch (e) {
        throw e;
    }
})()
    .catch((e) => { $.logErr(e), $.msg($.name, `⛔️ script run error!`, e.message || e) })
    .finally(async () => {
        $.done({ ok: 1 });
    });
function getDateTime() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
/** ---------------------------------固定不动区域----------------------------------------- */
//prettier-ignore
async function sendMsg(a) { a && ($.isNode() ? await notify.sendNotify($.name, a) : $.msg($.name, $.title || "", a, { "media-url": $.avatar })) }
function DoubleLog(o) { o && ($.log(`${o}`), $.notifyMsg.push(`${o}`)) };
function debug(g, e = "debug") { "true" === $.is_debug && ($.log(`\n-----------${e}------------\n`), $.log("string" == typeof g ? g : $.toStr(g) || `debug error => t=${g}`), $.log(`\n-----------${e}------------\n`)) }
//From xream's ObjectKeys2LowerCase
function ObjectKeys2LowerCase(obj) { return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v])) };
//From sliverkiss's Request
async function Request(t) { "string" == typeof t && (t = { url: t }); try { if (!t?.url) throw new Error("[发送请求] 缺少 url 参数"); let { url: o, type: e, headers: r = {}, body: s, params: a, dataType: n = "form", resultType: u = "data" } = t; const p = e ? e?.toLowerCase() : "body" in t ? "post" : "get", c = o.concat("post" === p ? "?" + $.queryStr(a) : ""), i = t.timeout ? $.isSurge() ? t.timeout / 1e3 : t.timeout : 1e4; "json" === n && (r["Content-Type"] = "application/json;charset=UTF-8"); const y = s && "form" == n ? $.queryStr(s) : $.toStr(s), l = { ...t, ...t?.opts ? t.opts : {}, url: c, headers: r, ..."post" === p && { body: y }, ..."get" === p && a && { params: a }, timeout: i }, m = $.http[p.toLowerCase()](l).then((t => "data" == u ? $.toObj(t.body) || t.body : $.toObj(t) || t)).catch((t => $.log(`❌请求发起失败！原因为：${t}`))); return Promise.race([new Promise(((t, o) => setTimeout((() => o("当前请求已超时")), i))), m]) } catch (t) { console.log(`❌请求发起失败！原因为：${t}`) } }
//From chavyleung's Env.js
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise(((e, r) => { s.call(this, t, ((t, s, a) => { t ? r(t) : e(s) })) })) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } getEnv() { return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : void 0 } isNode() { return "Node.js" === this.getEnv() } isQuanX() { return "Quantumult X" === this.getEnv() } isSurge() { return "Surge" === this.getEnv() } isLoon() { return "Loon" === this.getEnv() } isShadowrocket() { return "Shadowrocket" === this.getEnv() } isStash() { return "Stash" === this.getEnv() } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; if (this.getdata(t)) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise((e => { this.get({ url: t }, ((t, s, r) => e(r))) })) } runScript(t, e) { return new Promise((s => { let r = this.getdata("@chavy_boxjs_userCfgs.httpapi"); r = r ? r.replace(/\n/g, "").trim() : r; let a = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); a = a ? 1 * a : 20, a = e && e.timeout ? e.timeout : a; const [i, o] = r.split("@"), n = { url: `http://${o}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: a }, headers: { "X-Key": i, Accept: "*/*" }, timeout: a }; this.post(n, ((t, e, r) => s(r))) })).catch((t => this.logErr(t))) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), r = !s && this.fs.existsSync(e); if (!s && !r) return {}; { const r = s ? t : e; try { return JSON.parse(this.fs.readFileSync(r)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), r = !s && this.fs.existsSync(e), a = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, a) : r ? this.fs.writeFileSync(e, a) : this.fs.writeFileSync(t, a) } } lodash_get(t, e, s = void 0) { const r = e.replace(/\[(\d+)\]/g, ".$1").split("."); let a = t; for (const t of r) if (a = Object(a)[t], void 0 === a) return s; return a } lodash_set(t, e, s) { return Object(t) !== t || (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce(((t, s, r) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[r + 1]) >> 0 == +e[r + 1] ? [] : {}), t)[e[e.length - 1]] = s), t } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, r] = /^@(.*?)\.(.*?)$/.exec(t), a = s ? this.getval(s) : ""; if (a) try { const t = JSON.parse(a); e = t ? this.lodash_get(t, r, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, r, a] = /^@(.*?)\.(.*?)$/.exec(e), i = this.getval(r), o = r ? "null" === i ? null : i || "{}" : "{}"; try { const e = JSON.parse(o); this.lodash_set(e, a, t), s = this.setval(JSON.stringify(e), r) } catch (e) { const i = {}; this.lodash_set(i, a, t), s = this.setval(JSON.stringify(i), r) } } else s = this.setval(t, e); return s } getval(t) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.read(t); case "Quantumult X": return $prefs.valueForKey(t); case "Node.js": return this.data = this.loaddata(), this.data[t]; default: return this.data && this.data[t] || null } } setval(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.write(t, e); case "Quantumult X": return $prefs.setValueForKey(t, e); case "Node.js": return this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0; default: return this.data && this.data[e] || null } } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { switch (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"], delete t.headers["content-type"], delete t.headers["content-length"]), t.params && (t.url += "?" + this.queryStr(t.params)), void 0 === t.followRedirect || t.followRedirect || ((this.isSurge() || this.isLoon()) && (t["auto-redirect"] = !1), this.isQuanX() && (t.opts ? t.opts.redirection = !1 : t.opts = { redirection: !1 })), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, ((t, s, r) => { !t && s && (s.body = r, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, r) })); break; case "Quantumult X": this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t => { const { statusCode: s, statusCode: r, headers: a, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: r, headers: a, body: i, bodyBytes: o }, i, o) }), (t => e(t && t.error || "UndefinedError"))); break; case "Node.js": let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", ((t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } })).then((t => { const { statusCode: r, statusCode: a, headers: i, rawBody: o } = t, n = s.decode(o, this.encoding); e(null, { status: r, statusCode: a, headers: i, rawBody: o, body: n }, n) }), (t => { const { message: r, response: a } = t; e(r, a, a && s.decode(a.rawBody, this.encoding)) })) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; switch (t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), void 0 === t.followRedirect || t.followRedirect || ((this.isSurge() || this.isLoon()) && (t["auto-redirect"] = !1), this.isQuanX() && (t.opts ? t.opts.redirection = !1 : t.opts = { redirection: !1 })), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, ((t, s, r) => { !t && s && (s.body = r, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, r) })); break; case "Quantumult X": t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t => { const { statusCode: s, statusCode: r, headers: a, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: r, headers: a, body: i, bodyBytes: o }, i, o) }), (t => e(t && t.error || "UndefinedError"))); break; case "Node.js": let r = require("iconv-lite"); this.initGotEnv(t); const { url: a, ...i } = t; this.got[s](a, i).then((t => { const { statusCode: s, statusCode: a, headers: i, rawBody: o } = t, n = r.decode(o, this.encoding); e(null, { status: s, statusCode: a, headers: i, rawBody: o, body: n }, n) }), (t => { const { message: s, response: a } = t; e(s, a, a && r.decode(a.rawBody, this.encoding)) })) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let r = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in r) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? r[e] : ("00" + r[e]).substr(("" + r[e]).length))); return t } queryStr(t) { let e = ""; for (const s in t) { let r = t[s]; null != r && "" !== r && ("object" == typeof r && (r = JSON.stringify(r)), e += `${s}=${r}&`) } return e = e.substring(0, e.length - 1), e } msg(e = t, s = "", r = "", a) { const i = t => { switch (typeof t) { case void 0: return t; case "string": switch (this.getEnv()) { case "Surge": case "Stash": default: return { url: t }; case "Loon": case "Shadowrocket": return t; case "Quantumult X": return { "open-url": t }; case "Node.js": return }case "object": switch (this.getEnv()) { case "Surge": case "Stash": case "Shadowrocket": default: return { url: t.url || t.openUrl || t["open-url"] }; case "Loon": return { openUrl: t.openUrl || t.url || t["open-url"], mediaUrl: t.mediaUrl || t["media-url"] }; case "Quantumult X": return { "open-url": t["open-url"] || t.url || t.openUrl, "media-url": t["media-url"] || t.mediaUrl, "update-pasteboard": t["update-pasteboard"] || t.updatePasteboard }; case "Node.js": return }default: return } }; if (!this.isMute) switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: $notification.post(e, s, r, i(a)); break; case "Quantumult X": $notify(e, s, r, i(a)); case "Node.js": }if (!this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), r && t.push(r), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: this.log("", `❗️${this.name}, 错误!`, t); break; case "Node.js": this.log("", `❗️${this.name}, 错误!`, t.stack) } } wait(t) { return new Promise((e => setTimeout(e, t))) } done(t = {}) { const e = ((new Date).getTime() - this.startTime) / 1e3; switch (this.log("", `🔔${this.name}, 结束! 🕛 ${e} 秒`), this.log(), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: $done(t); break; case "Node.js": process.exit(1) } } }(t, e) }
