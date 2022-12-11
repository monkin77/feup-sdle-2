/**
 * Parses the bootstrap info defined in .env and returns an array of addresses
 */
export const parseBootstrapAddresses = () => {
    const ips = process.env.BOOTSTRAP_IPS.split(",");
    const ports = process.env.BOOTSTRAP_PORTS.split(",");
    const ids = process.env.BOOTSTRAP_IDS.split(",");

    if (ips.length !== ports.length || ips.length !== ids.length) {
        throw new Error("Bootstrap info is not well defined in .env");
    }

    const addresses = [];
    for (let i = 0; i < ips.length; i++) {
        addresses.push(`/ip4/${ips[i]}/tcp/${ports[i]}/p2p/${ids[i]}`);
    }
    return addresses;
};
