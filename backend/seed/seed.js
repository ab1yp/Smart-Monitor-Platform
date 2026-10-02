require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ============================================================================
// MODELS
// ============================================================================

const User = require("../models/user.model");
const Device = require("../models/device.model");
const DeviceMember = require("../models/deviceMember.model");
const Status = require("../models/status.model");

const RoomTemperature = require("../models/roomTemperature.model");
const Setpoint = require("../models/setpoint.model");
const CompressorState = require("../models/compressorState.model");
const CompressorFrequency = require("../models/compressorFrequency.model");
const Power = require("../models/power.model");
const Current = require("../models/current.model");
const InternalTemperature = require("../models/internalTemperature.model");
const AcError = require("../models/error.model");

// ============================================================================
// CONFIGURATION
// ============================================================================

const USER_COUNT = 12;
const DEVICE_COUNT = 100;

// 30 days × every 15 minutes
// = 2,881 readings/device
// = 288,100 readings for each single-value collection
// = 864,300 internal-temperature records
// Total is about 2.59 million measurement documents before generated errors.

const DAYS = 30;
const INTERVAL_MINUTES = 15;

const BATCH_SIZE = 1000;

// Set to true when you want to delete old seed data before generating again.
const CLEAR_SEED_DATA =
    process.env.CLEAR_SEED_DATA === "true";

// Internal temperature sensors
const INTERNAL_SENSORS = [
    "evaporator",
    "condenser",
    "discharge",
];

// ============================================================================
// HELPERS
// ============================================================================

const rand = (min, max) => {
    return Math.random() * (max - min) + min;
};

const randInt = (min, max) => {
    return Math.floor(rand(min, max + 1));
};

const pick = (array) => {
    return array[randInt(0, array.length - 1)];
};

const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};

const round = (value, decimals = 2) => {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
};

const noise = (amount) => {
    return rand(-amount, amount);
};

const getMongoUri = () => {
    if (!process.env.MONGO_URL) {
        throw new Error(
            "MONGO_URL is missing in .env"
        );
    }

    return process.env.MONGO_URL;
};

const getDateRange = () => {
    const end = new Date();

    const start = new Date(end);

    start.setDate(
        start.getDate() - DAYS
    );

    return {
        start,
        end,
    };
};

const getTotalPoints = () => {
    return (
        Math.floor(
            (
                DAYS *
                24 *
                60
            ) /
            INTERVAL_MINUTES
        ) + 1
    );
};

// ============================================================================
// BATCH INSERT
// ============================================================================

const insertInBatches = async (
    Model,
    documents,
    label
) => {
    if (!documents.length) {
        return;
    }

    const total = documents.length;

    for (
        let i = 0;
        i < total;
        i += BATCH_SIZE
    ) {
        const batch =
            documents.slice(
                i,
                i + BATCH_SIZE
            );

        await Model.insertMany(
            batch,
            {
                ordered: false,
            }
        );

        const current =
            Math.min(
                i + batch.length,
                total
            );

        const percentage =
            (
                current / total
            ) * 100;

        process.stdout.write(
            `\r${label}: ${percentage.toFixed(1)}%`
        );
    }

    process.stdout.write("\n");
};

// ============================================================================
// CLEAR OLD SEED DATA
// ============================================================================

const clearSeedData = async () => {
    console.log(
        "\nClearing previous seed data...\n"
    );

    const seedUsers = await User.find({
        email: {
            $regex: /@acmonitoring\.com$/i,
        },
    }).select("_id").lean();

    const seedUserIds = seedUsers.map(
        user => user._id
    );

    const seedDevices = await Device.find({
        serialNumber: {
            $regex: /^SEED-AC-/,
        },
    }).select("_id").lean();

    const seedDeviceIds = seedDevices.map(
        device => device._id
    );

    if (seedDeviceIds.length) {
        await Promise.all([
            Status.deleteMany({
                deviceId: { $in: seedDeviceIds },
            }),

            DeviceMember.deleteMany({
                deviceId: { $in: seedDeviceIds },
            }),

            CompressorFrequency.deleteMany({
                deviceId: { $in: seedDeviceIds },
            }),

            CompressorState.deleteMany({
                deviceId: { $in: seedDeviceIds },
            }),

            Current.deleteMany({
                deviceId: { $in: seedDeviceIds },
            }),

            AcError.deleteMany({
                deviceId: { $in: seedDeviceIds },
            }),

            InternalTemperature.deleteMany({
                deviceId: { $in: seedDeviceIds },
            }),

            Power.deleteMany({
                deviceId: { $in: seedDeviceIds },
            }),

            RoomTemperature.deleteMany({
                deviceId: { $in: seedDeviceIds },
            }),

            Setpoint.deleteMany({
                deviceId: { $in: seedDeviceIds },
            }),

            Device.deleteMany({
                _id: { $in: seedDeviceIds },
                serialNumber: { $regex: /^SEED-AC-/ },
            }),
        ]);
    }

    if (seedUserIds.length) {
        await User.deleteMany({
            _id: { $in: seedUserIds },
            email: { $regex: /@acmonitoring\.com$/i },
        });
    }

    console.log(
        `Removed ${seedUsers.length} seed users and ${seedDevices.length} seed devices.`
    );
};

// ============================================================================
// CREATE USERS
// ============================================================================

const createUsers = async () => {
    console.log(
        "Creating users..."
    );

    const password =
        await bcrypt.hash(
            "Password123!",
            10
        );

    const users = [];

    for (
        let i = 1;
        i <= USER_COUNT;
        i++
    ) {
        users.push({
            name:
                `Demo User ${i}`,

            about:
                `Seed user ${i} for AC monitoring testing`,

            email:
                `demo.user${i}@acmonitoring.com`,

            password,
        });
    }

    const createdUsers =
        await User.insertMany(
            users
        );

    console.log(
        `Created ${createdUsers.length} users.`
    );

    return createdUsers;
};

// ============================================================================
// CREATE DEVICES
// ============================================================================

const createDevices = async (
    users
) => {
    console.log(
        "\nCreating devices..."
    );

    const devices = [];
    const deviceMembers = [];

    const locations = [
        "Building A - Floor 1",
        "Building A - Floor 2",
        "Building A - Floor 3",

        "Building B - Floor 1",
        "Building B - Floor 2",
        "Building B - Floor 3",

        "Building C - Floor 1",
        "Building C - Floor 2",

        "Building D - Floor 1",
        "Building D - Floor 2",
    ];

    const models = [
        "Split-X100",
        "Split-X200",
        "Split-Pro 18K",
        "Split-Pro 24K",
        "Split-Inverter 18K",
        "Split-Inverter 24K",
    ];

    const now = new Date();

    // ------------------------------------------------------------------------
    // Generate devices
    // ------------------------------------------------------------------------

    for (
        let i = 1;
        i <= DEVICE_COUNT;
        i++
    ) {
        const owner =
            users[
            (i - 1) %
            users.length
            ];

        const installationDate =
            new Date(now);

        installationDate.setDate(
            installationDate.getDate() -
            randInt(60, 900)
        );

        devices.push({
            name:
                `Split AC ${String(i).padStart(3, "0")}`,

            description:
                `Demo split AC device ${i}`,

            model:
                pick(models),

            serialNumber:
                `SEED-AC-${String(i).padStart(4, "0")}`,

            location:
                pick(locations),

            installationDate,

            ownerId:
                owner._id,
        });
    }

    const createdDevices =
        await Device.insertMany(
            devices
        );

    // ------------------------------------------------------------------------
    // Generate device members
    // ------------------------------------------------------------------------

    for (
        const device of createdDevices
    ) {
        const ownerId =
            device.ownerId;

        // Owner
        deviceMembers.push({
            role: "owner",

            userId:
                ownerId,

            createdById:
                ownerId,

            deviceId:
                device._id,
        });

        // Additional members
        const additionalMembers =
            randInt(1, 3);

        const addedUsers =
            new Set([
                String(ownerId),
            ]);

        while (
            addedUsers.size <
            additionalMembers + 1
        ) {
            const user =
                pick(users);

            const userId =
                String(user._id);

            if (
                addedUsers.has(userId)
            ) {
                continue;
            }

            addedUsers.add(
                userId
            );

            deviceMembers.push({
                role:
                    pick([
                        "member",
                        "member",
                        "admin",
                    ]),

                userId:
                    user._id,

                createdById:
                    ownerId,

                deviceId:
                    device._id,
            });
        }
    }

    await DeviceMember.insertMany(
        deviceMembers,
        {
            ordered: false,
        }
    );

    console.log(
        `Created ${createdDevices.length} devices.`
    );

    console.log(
        `Created ${deviceMembers.length} device memberships.`
    );

    return createdDevices;
};

// ============================================================================
// DEVICE PROFILE
// ============================================================================

const createDeviceProfile = () => {
    const setpoint =
        pick([
            22,
            23,
            24,
            25,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Nominal electrical characteristics
    |--------------------------------------------------------------------------
    */

    const nominalCurrent =
        rand(4.5, 9.5);

    const voltage =
        rand(210, 240);

    const powerFactor =
        rand(0.82, 0.96);

    const nominalPower =
        nominalCurrent *
        voltage *
        powerFactor;

    /*
    |--------------------------------------------------------------------------
    | Degradation
    |--------------------------------------------------------------------------
    |
    | Some devices gradually deteriorate.
    | This gives us useful patterns for predictive-maintenance testing.
    |
    */

    const degradation =
        Math.random() < 0.18
            ? rand(0.08, 0.30)
            : 0;

    /*
    |--------------------------------------------------------------------------
    | Failure bias
    |--------------------------------------------------------------------------
    |
    | Some devices receive more abnormal behavior.
    |
    */

    const failureBias =
        Math.random() < 0.12
            ? rand(0.3, 0.8)
            : 0;

    return {
        setpoint,

        nominalCurrent,

        nominalPower,

        degradation,

        failureBias,
    };
};

// ============================================================================
// GENERATE ONE DEVICE DATA
// ============================================================================

const generateDeviceReadings = async (
    device
) => {
    const {
        start,
        end,
    } = getDateRange();

    const totalPoints =
        getTotalPoints();

    const profile =
        createDeviceProfile();

    // ------------------------------------------------------------------------
    // Temporary arrays
    // ------------------------------------------------------------------------

    const roomTemperatureDocs = [];

    const setpointDocs = [];

    const compressorStateDocs = [];

    const compressorFrequencyDocs = [];

    const powerDocs = [];

    const currentDocs = [];

    const internalTemperatureDocs = [];

    const errorDocs = [];

    // ------------------------------------------------------------------------
    // Initial state
    // ------------------------------------------------------------------------

    let previousRoomTemperature =
        rand(24, 29);

    let compressorWasOn =
        false;

    let latestSnapshot = null;
    let latestError = null;

    // ------------------------------------------------------------------------
    // Generate historical readings
    // ------------------------------------------------------------------------

    for (
        let i = 0;
        i < totalPoints;
        i++
    ) {
        const timestamp =
            new Date(
                start.getTime() +
                (
                    i *
                    INTERVAL_MINUTES *
                    60 *
                    1000
                )
            );

        if (
            timestamp >
            end
        ) {
            break;
        }

        const hour =
            timestamp.getHours();

        const minute =
            timestamp.getMinutes();

        // ====================================================================
        // ENVIRONMENT
        // ====================================================================

        const hourDecimal =
            hour +
            minute / 60;

        const dailyHeat =
            Math.sin(
                (
                    hourDecimal /
                    24
                ) *
                Math.PI *
                2 -
                1.2
            );

        const ambientTemperature =
            25.5 +
            (
                dailyHeat *
                4.2
            ) +
            noise(1.0);

        // ====================================================================
        // DEMAND
        // ====================================================================

        const workingHour =
            hour >= 7 &&
            hour < 23;

        const demand =
            workingHour
                ? rand(0.62, 0.98)
                : rand(0.25, 0.78);

        // ====================================================================
        // SETPOINT
        // ====================================================================

        let setpoint =
            profile.setpoint;

        // Occasionally change the target temperature
        if (
            Math.random() < 0.08
        ) {
            setpoint =
                clamp(
                    profile.setpoint +
                    pick([
                        -2,
                        -1,
                        0,
                        1,
                        2,
                    ]),
                    18,
                    28
                );
        }

        // ====================================================================
        // COMPRESSOR
        // ====================================================================

        const temperatureGap =
            previousRoomTemperature -
            setpoint;

        let compressorOn =
            temperatureGap > 0.7 &&
            demand > 0.38;

        // Natural random behavior
        if (
            Math.random() <
            0.025
        ) {
            compressorOn =
                !compressorOn;
        }

        // Avoid unrealistic immediate shutdown
        if (
            compressorWasOn &&
            temperatureGap > -0.3 &&
            Math.random() < 0.20
        ) {
            compressorOn = true;
        }

        // ====================================================================
        // DEGRADATION
        // ====================================================================

        const degradationProgress =
            profile.degradation *
            (
                i /
                Math.max(
                    totalPoints - 1,
                    1
                )
            );

        // ====================================================================
        // ROOM TEMPERATURE
        // ====================================================================

        const coolingEffect =
            compressorOn
                ? rand(0.45, 1.05) *
                (
                    1 -
                    (
                        degradationProgress *
                        0.25
                    )
                )
                : rand(
                    -0.10,
                    0.15
                );

        let roomTemperature =
            previousRoomTemperature;

        // Ambient influence
        roomTemperature +=
            (
                ambientTemperature -
                roomTemperature
            ) *
            0.08;

        // AC cooling
        roomTemperature -=
            coolingEffect;

        // Sensor noise
        roomTemperature +=
            noise(0.12);

        roomTemperature =
            clamp(
                roomTemperature,
                16,
                36
            );

        previousRoomTemperature =
            roomTemperature;

        // ====================================================================
        // ELECTRICAL VALUES
        // ====================================================================

        let current = 0.35;
        let power = 35;
        let compressorFrequency = 0;

        if (
            compressorOn
        ) {
            const load =
                clamp(
                    0.45 +
                    (
                        temperatureGap /
                        6
                    ) +
                    (
                        demand *
                        0.35
                    ) +
                    degradationProgress,

                    0.25,
                    1.35
                );

            compressorFrequency =
                clamp(
                    35 +
                    (
                        load *
                        35
                    ) +
                    noise(4) +
                    (
                        degradationProgress *
                        12
                    ),

                    20,
                    75
                );

            current =
                clamp(
                    profile.nominalCurrent *
                    (
                        0.55 +
                        load *
                        0.55
                    ) +

                    (
                        profile.failureBias *
                        rand(0.3, 1.3)
                    ) +

                    noise(0.25),

                    1.2,
                    14
                );

            power =
                clamp(
                    profile.nominalPower *
                    (
                        0.52 +
                        load *
                        0.62
                    ) +

                    (
                        profile.failureBias *
                        rand(30, 130)
                    ) +

                    noise(20),

                    100,
                    3200
                );
        } else {
            // Standby / fan-only consumption
            current =
                clamp(
                    0.25 +
                    noise(0.08),

                    0.05,
                    0.8
                );

            power =
                clamp(
                    20 +
                    (
                        current *
                        80
                    ) +
                    noise(8),

                    5,
                    130
                );

            compressorFrequency =
                0;
        }

        // ====================================================================
        // INTERNAL TEMPERATURES
        // ====================================================================

        const evaporatorTemperature =
            compressorOn
                ? clamp(
                    8.5 +
                    (
                        (
                            roomTemperature -
                            setpoint
                        ) *
                        0.4
                    ) +
                    noise(0.8) +
                    (
                        degradationProgress *
                        4
                    ),

                    4,
                    18
                )
                : clamp(
                    18 +
                    noise(1.5),

                    12,
                    25
                );

        const condenserTemperature =
            compressorOn
                ? clamp(
                    42 +
                    (
                        current *
                        1.35
                    ) +
                    noise(2.0) +
                    (
                        degradationProgress *
                        10
                    ),

                    30,
                    75
                )
                : clamp(
                    29 +
                    noise(1.5),

                    24,
                    38
                );

        const dischargeTemperature =
            compressorOn
                ? clamp(
                    58 +
                    (
                        current *
                        3.2
                    ) +
                    noise(2.5) +
                    (
                        degradationProgress *
                        14
                    ),

                    45,
                    105
                )
                : clamp(
                    31 +
                    noise(1.5),

                    25,
                    40
                );

        // ====================================================================
        // SAVE ROOM TEMPERATURE
        // ====================================================================

        roomTemperatureDocs.push({
            deviceId:
                device._id,

            timestamp,

            value:
                round(
                    roomTemperature
                ),
        });

        // ====================================================================
        // SAVE SETPOINT
        // ====================================================================

        setpointDocs.push({
            deviceId:
                device._id,

            timestamp,

            value:
                round(
                    setpoint
                ),
        });

        // ====================================================================
        // SAVE COMPRESSOR STATE
        // ====================================================================

        compressorStateDocs.push({
            deviceId:
                device._id,

            timestamp,

            value:
                compressorOn
                    ? "ON"
                    : "OFF",
        });

        // ====================================================================
        // SAVE COMPRESSOR FREQUENCY
        // ====================================================================

        compressorFrequencyDocs.push({
            deviceId:
                device._id,

            timestamp,

            value:
                round(
                    compressorFrequency
                ),
        });

        // ====================================================================
        // SAVE POWER
        // ====================================================================

        powerDocs.push({
            deviceId:
                device._id,

            timestamp,

            value:
                round(
                    power
                ),
        });

        // ====================================================================
        // SAVE CURRENT
        // ====================================================================

        currentDocs.push({
            deviceId:
                device._id,

            timestamp,

            value:
                round(
                    current
                ),
        });

        // ====================================================================
        // SAVE INTERNAL TEMPERATURES
        // ====================================================================

        const internalTemperatureValues = {
            evaporator:
                evaporatorTemperature,

            condenser:
                condenserTemperature,

            discharge:
                dischargeTemperature,
        };

        latestSnapshot = {
            timestamp,
            compressor: compressorOn ? "ON" : "OFF",
            roomTemperature: round(roomTemperature),
            setpoint: round(setpoint),
            compressorFrequency: round(compressorFrequency),
            power: round(power),
            current: round(current),
            internalTemperature: {
                evaporator: {
                    value: round(evaporatorTemperature),
                    timestamp,
                },
                condenser: {
                    value: round(condenserTemperature),
                    timestamp,
                },
                discharge: {
                    value: round(dischargeTemperature),
                    timestamp,
                },
            },
        };

        for (
            const sensor
            of INTERNAL_SENSORS
        ) {
            internalTemperatureDocs.push({
                deviceId:
                    device._id,

                timestamp,

                sensor,

                value:
                    round(
                        internalTemperatureValues[
                        sensor
                        ]
                    ),
            });
        }

        // ====================================================================
        // ERRORS
        // ====================================================================

        const errorProbability =
            profile.failureBias > 0
                ? 0.0009
                : 0.00015;

        if (
            compressorOn &&
            Math.random() <
            errorProbability
        ) {
            const errorCode = pick([
                "E01",
                "E03",
                "E04",
                "E07",
                "E09",
                "HIGH_CURRENT",
                "OVER_TEMPERATURE",
                "COMPRESSOR_OVERLOAD",
            ]);

            errorDocs.push({
                deviceId: device._id,
                timestamp,
                code: errorCode,
            });

            latestError = {
                code: errorCode,
                timestamp,
            };
        }

        // ====================================================================
        // CONTINUE STATE
        // ====================================================================

        compressorWasOn =
            compressorOn;

        // ====================================================================
        // FLUSH WHEN MEMORY IS LARGE
        // ====================================================================

        if (
            roomTemperatureDocs.length >=
            BATCH_SIZE
        ) {
            await flushDeviceData({
                roomTemperatureDocs,
                setpointDocs,
                compressorStateDocs,
                compressorFrequencyDocs,
                powerDocs,
                currentDocs,
                internalTemperatureDocs,
                errorDocs,
            });

            // Clear arrays
            roomTemperatureDocs.length = 0;
            setpointDocs.length = 0;
            compressorStateDocs.length = 0;
            compressorFrequencyDocs.length = 0;
            powerDocs.length = 0;
            currentDocs.length = 0;
            internalTemperatureDocs.length = 0;
            errorDocs.length = 0;
        }
    }

    // ========================================================================
    // INSERT REMAINING DOCUMENTS
    // ========================================================================

    await flushDeviceData({
        roomTemperatureDocs,
        setpointDocs,
        compressorStateDocs,
        compressorFrequencyDocs,
        powerDocs,
        currentDocs,
        internalTemperatureDocs,
        errorDocs,
    });

    const lastUpdated = latestSnapshot?.timestamp ?? null;
    const online = lastUpdated
        ? Date.now() - new Date(lastUpdated).getTime() <= 10 * 60 * 1000
        : false;

    await Status.findOneAndUpdate(
        { deviceId: device._id },
        {
            deviceId: device._id,
            online,
            compressor: latestSnapshot?.compressor ?? "OFF",
            roomTemperature: latestSnapshot?.roomTemperature ?? null,
            setpoint: latestSnapshot?.setpoint ?? null,
            compressorFrequency: latestSnapshot?.compressorFrequency ?? 0,
            power: latestSnapshot?.power ?? 0,
            current: latestSnapshot?.current ?? 0,
            internalTemperature: latestSnapshot?.internalTemperature ?? {
                evaporator: null,
                condenser: null,
                discharge: null,
            },
            lastError: latestError,
            lastUpdated,
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        }
    );

    console.log(`Status snapshot created for ${device.name}.`);
};

// ============================================================================
// FLUSH DEVICE DATA
// ============================================================================

const flushDeviceData = async ({
    roomTemperatureDocs,
    setpointDocs,
    compressorStateDocs,
    compressorFrequencyDocs,
    powerDocs,
    currentDocs,
    internalTemperatureDocs,
    errorDocs,
}) => {
    await Promise.all([
        insertInBatches(
            RoomTemperature,
            roomTemperatureDocs,
            "Room temperature"
        ),

        insertInBatches(
            Setpoint,
            setpointDocs,
            "Setpoint"
        ),

        insertInBatches(
            CompressorState,
            compressorStateDocs,
            "Compressor state"
        ),

        insertInBatches(
            CompressorFrequency,
            compressorFrequencyDocs,
            "Compressor frequency"
        ),

        insertInBatches(
            Power,
            powerDocs,
            "Power"
        ),

        insertInBatches(
            Current,
            currentDocs,
            "Current"
        ),

        insertInBatches(
            InternalTemperature,
            internalTemperatureDocs,
            "Internal temperature"
        ),

        insertInBatches(
            AcError,
            errorDocs,
            "Errors"
        ),
    ]);
};

// ============================================================================
// MAIN
// ============================================================================

const main = async () => {
    const startedAt =
        Date.now();

    try {
        // ====================================================================
        // CONNECT
        // ====================================================================

        await mongoose.connect(
            getMongoUri()
        );

        console.log(
            "\nMongoDB connected:"
        );

        console.log(
            mongoose.connection.host
        );

        // ====================================================================
        // CLEAR
        // ====================================================================

        if (
            CLEAR_SEED_DATA
        ) {
            await clearSeedData();
        }

        // ====================================================================
        // USERS
        // ====================================================================

        const users =
            await createUsers();

        // ====================================================================
        // DEVICES
        // ====================================================================

        const devices =
            await createDevices(
                users
            );

        // ====================================================================
        // STATISTICS
        // ====================================================================

        const pointsPerDevice =
            getTotalPoints();

        console.log(
            "\n--------------------------------------------"
        );

        console.log(
            "Dataset configuration"
        );

        console.log(
            "--------------------------------------------"
        );

        console.log(
            `Users: ${USER_COUNT}`
        );

        console.log(
            `Devices: ${DEVICE_COUNT}`
        );

        console.log(
            `Days: ${DAYS}`
        );

        console.log(
            `Interval: ${INTERVAL_MINUTES} minutes`
        );

        console.log(
            `Points per device: ${pointsPerDevice}`
        );

        console.log(
            `Single-value readings: ${pointsPerDevice *
            DEVICE_COUNT *
            6
            }`
        );

        console.log(
            `Internal temperature readings: ${pointsPerDevice *
            DEVICE_COUNT *
            3
            }`
        );

        console.log(
            `Status snapshots: ${DEVICE_COUNT}`
        );

        console.log(
            "--------------------------------------------\n"
        );

        // ====================================================================
        // GENERATE READINGS
        // ====================================================================

        for (
            let i = 0;
            i < devices.length;
            i++
        ) {
            const device =
                devices[i];

            console.log(
                `\n[${i + 1}/${devices.length}] ${device.name}`
            );

            await generateDeviceReadings(
                device
            );
        }

        // ====================================================================
        // DONE
        // ====================================================================

        const duration =
            (
                (
                    Date.now() -
                    startedAt
                ) /
                1000
            ).toFixed(1);

        console.log(
            "\n============================================"
        );

        console.log(
            "SEED COMPLETED SUCCESSFULLY"
        );

        console.log(
            "============================================"
        );

        console.log(
            `Users: ${USER_COUNT}`
        );

        console.log(
            `Devices: ${DEVICE_COUNT}`
        );

        console.log(
            `Days: ${DAYS}`
        );

        console.log(
            `Interval: ${INTERVAL_MINUTES} minutes`
        );

        console.log(
            `Duration: ${duration} seconds`
        );

        console.log(
            "============================================\n"
        );

        await mongoose.disconnect();

        process.exit(0);
    } catch (error) {
        console.error(
            "\n============================================"
        );

        console.error(
            "SEED FAILED"
        );

        console.error(
            "============================================"
        );

        console.error(
            error
        );

        await mongoose
            .disconnect()
            .catch(() => { });

        process.exit(1);
    }
};

// ============================================================================
// START
// ============================================================================

main();