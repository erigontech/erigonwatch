export const hardwareInfoMock = {
	disk: {
		fsType: "apfs",
		total: 7998551654400,
		free: 4490433454080,
		mountPoint: "/Volumes/DATA",
		device: "/dev/disk3s7",
		details:
			"   Device Identifier:         disk3s7\n   Device Node:               /dev/disk3s7\n   Whole:                     No\n   Part of Whole:             disk3\n\n   Volume Name:               DATA\n   Mounted:                   Yes\n   Mount Point:               /Volumes/DATA\n\n   Partition Type:            41504653-0000-11AA-AA11-00306543ECAC\n   File System Personality:   APFS\n   Type (Bundle):             apfs\n   Name (User Visible):       APFS\n   Owners:                    Enabled\n\n   OS Can Be Installed:       Yes\n   Booter Disk:               disk3s2\n   Recovery Disk:             disk3s3\n   Media Type:                Generic\n   Protocol:                  Apple Fabric\n   SMART Status:              Verified\n   Volume UUID:               0FCAB784-845D-4D7B-A1FD-B91469C3FAE0\n   Disk / Partition UUID:     0FCAB784-845D-4D7B-A1FD-B91469C3FAE0\n\n   Disk Size:                 8.0 TB (7998551654400 Bytes) (exactly 15622171200 512-Byte-Units)\n   Device Block Size:         4096 Bytes\n\n   Volume Used Space:         3.2 TB (3227450064896 Bytes) (exactly 6303613408 512-Byte-Units)\n   Container Total Space:     8.0 TB (7998551654400 Bytes) (exactly 15622171200 512-Byte-Units)\n   Container Free Space:      4.5 TB (4490433454080 Bytes) (exactly 8770377840 512-Byte-Units)\n   Allocation Block Size:     4096 Bytes\n\n   Media OS Use Only:         No\n   Media Read-Only:           No\n   Volume Read-Only:          No\n\n   Device Location:           Internal\n   Removable Media:           Fixed\n\n   Solid State:               Yes\n   Hardware AES Support:      Yes\n\n   This disk is an APFS Volume.  APFS Information:\n   APFS Container:            disk3\n   APFS Physical Store:       disk0s2\n   Fusion Drive:              No\n   FileVault:                 No\n   Sealed:                    No\n   Locked:                    No\n\n"
	},
	ram: {
		total: 137438953472,
		available: 97172701184,
		used: 40266252288,
		usedPercent: 29.29755449295044
	},
	cpu: [
		{
			cpu: 0,
			vendorId: "",
			family: "",
			model: "",
			stepping: 0,
			physicalId: "",
			coreId: "",
			cores: 16,
			modelName: "Apple M3 Max",
			mhz: 4056,
			cacheSize: 0,
			flags: null,
			microcode: ""
		}
	]
};

export const cpuUsageMock = {
	Total: 9.335038368532151,
	Cores: [
		35.41666666464557, 29.896907221196496, 23.711340204948293, 19.58762888008433, 1.0101010110512423, 1.0000000009313226, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
	]
};

export const processesInfoMock = [
	{
		Pid: 12949,
		Name: "mdworker_shared",
		CPUUsage: 0.0893334009381204,
		Memory: 0.022602081
	},
	{
		Pid: 58513,
		Name: "trustd",
		CPUUsage: 0.08550301731434526,
		Memory: 0.026130676
	},
	{
		Pid: 64508,
		Name: "Code Helper (GPU)",
		CPUUsage: 2.8053821816317637,
		Memory: 0.098478794
	},
	{
		Pid: 621,
		Name: "networkserviceproxy",
		CPUUsage: 0.015189684379902719,
		Memory: 0.10665655
	},
	{
		Pid: 75311,
		Name: "Discord Helper (GPU)",
		CPUUsage: 0.9278991005255645,
		Memory: 0.13794899
	},
	{
		Pid: 9671,
		Name: "spotlightknowledged",
		CPUUsage: 3.167544923760957,
		Memory: 0.12847185
	},
	{
		Pid: 64796,
		Name: "Code Helper",
		CPUUsage: 0.015405579482584536,
		Memory: 0.056302547
	},
	{
		Pid: 98346,
		Name: "com.apple.appkit.xpc.openAndSavePanelService",
		CPUUsage: 0.0038171986611097233,
		Memory: 0.07361174
	},
	{
		Pid: 13241,
		Name: "mdworker_shared",
		CPUUsage: 0.13714126355751932,
		Memory: 0.017929077
	},
	{
		Pid: 64801,
		Name: "Code Helper (Plugin)",
		CPUUsage: 0.14734917347787374,
		Memory: 0.53288937
	},
	{
		Pid: 11968,
		Name: "Postman",
		CPUUsage: 1.329951131872018,
		Memory: 0.22152424
	},
	{
		Pid: 12958,
		Name: "mdworker_shared",
		CPUUsage: 0.17709086693247839,
		Memory: 0.023114681
	},
	{
		Pid: 67018,
		Name: "GitHub Desktop",
		CPUUsage: 0.05337257601250682,
		Memory: 0.13760328
	},
	{
		Pid: 67024,
		Name: "GitHub Desktop Helper (GPU)",
		CPUUsage: 0.03741308820774076,
		Memory: 0.077831745
	},
	{
		Pid: 713,
		Name: "QuickLookUIService",
		CPUUsage: 0.0031540647610532853,
		Memory: 0.098121166
	},
	{
		Pid: 810,
		Name: "VTDecoderXPCService",
		CPUUsage: 0.09606484001291736,
		Memory: 0.027275085
	},
	{
		Pid: 12641,
		Name: "mdworker_shared",
		CPUUsage: 0.08990604965088941,
		Memory: 0.023388863
	},
	{
		Pid: 75308,
		Name: "Discord",
		CPUUsage: 0.24025189252948548,
		Memory: 0.17745495
	},
	{
		Pid: 89584,
		Name: "com.apple.appkit.xpc.openAndSavePanelService",
		CPUUsage: 0.0018674873655328658,
		Memory: 0.068449974
	},
	{
		Pid: 666,
		Name: "TextEdit",
		CPUUsage: 0.0035584722998249995,
		Memory: 0.24865866
	},
	{
		Pid: 1191,
		Name: "Code Helper (Plugin)",
		CPUUsage: 0.055947698452628127,
		Memory: 0.06301403
	},
	{
		Pid: 1362,
		Name: "UniversalControl",
		CPUUsage: 0.14633680262423965,
		Memory: 0.023663044
	},
	{
		Pid: 591,
		Name: "distnoted",
		CPUUsage: 0.06198833681489949,
		Memory: 0.006890297
	},
	{
		Pid: 98314,
		Name: "Code Helper (Renderer)",
		CPUUsage: 0.024481111613815675,
		Memory: 0.11877298
	},
	{
		Pid: 17978,
		Name: "DocumentPopoverViewService",
		CPUUsage: 0.0008111223857933553,
		Memory: 0.052046776
	},
	{
		Pid: 12957,
		Name: "mdworker_shared",
		CPUUsage: 0.05893797686785364,
		Memory: 0.017797947
	},
	{
		Pid: 2317,
		Name: "searchpartyuseragent",
		CPUUsage: 0.4984133776982276,
		Memory: 0.04492283
	},
	{
		Pid: 2017,
		Name: "com.apple.appkit.xpc.openAndSavePanelService",
		CPUUsage: 0.0010148835439349117,
		Memory: 0.059604645
	},
	{
		Pid: 634,
		Name: "Safari",
		CPUUsage: 1.274440330121036,
		Memory: 1.4617181
	},
	{
		Pid: 64514,
		Name: "Code Helper (Renderer)",
		CPUUsage: 1.0047995949102289,
		Memory: 0.34183264
	},
	{
		Pid: 65803,
		Name: "Code Helper (Plugin)",
		CPUUsage: 0.03207822807086871,
		Memory: 0.14163256
	},
	{
		Pid: 75317,
		Name: "Discord Helper (Renderer)",
		CPUUsage: 3.7801642068604147,
		Memory: 0.3698349
	},
	{
		Pid: 13269,
		Name: "mdworker_shared",
		CPUUsage: 2.04021539880125,
		Memory: 0.015192032
	},
	{
		Pid: 722,
		Name: "com.apple.Safari.History",
		CPUUsage: 0.040556701204260096,
		Memory: 0.08660555
	},
	{
		Pid: 12954,
		Name: "mdworker_shared",
		CPUUsage: 0.07234793383636827,
		Memory: 0.017917156
	},
	{
		Pid: 12643,
		Name: "mdworker_shared",
		CPUUsage: 0.07908939871191026,
		Memory: 0.022876263
	},
	{
		Pid: 2649,
		Name: "com.apple.WebKit.WebContent",
		CPUUsage: 0.20404889293540993,
		Memory: 1.051116
	},
	{
		Pid: 4370,
		Name: "com.apple.WebKit.WebContent",
		CPUUsage: 0.012783718608047254,
		Memory: 0.2116561
	},
	{
		Pid: 12950,
		Name: "mdworker_shared",
		CPUUsage: 0.05677779323970088,
		Memory: 0.01783371
	},
	{
		Pid: 6468,
		Name: "com.apple.PassKit.PaymentAuthorizationUIExtension",
		CPUUsage: 0.009064183924337933,
		Memory: 0.12217522
	},
	{
		Pid: 1131,
		Name: "com.apple.appkit.xpc.openAndSavePanelService",
		CPUUsage: 0.0010838258188536458,
		Memory: 0.071787834
	},
	{
		Pid: 64130,
		Name: "Terminal",
		CPUUsage: 0.017864413922887172,
		Memory: 0.08201599
	},
	{
		Pid: 60692,
		Name: "AppleSpell",
		CPUUsage: 0.0049188342459722655,
		Memory: 0.2906561
	},
	{
		Pid: 601,
		Name: "CoreServicesUIAgent",
		CPUUsage: 0.0006022112231884397,
		Memory: 0.06830692
	},
	{
		Pid: 373,
		Name: "loginwindow",
		CPUUsage: 0.11411011314821003,
		Memory: 0.08586645
	},
	{
		Pid: 605,
		Name: "WindowManager",
		CPUUsage: 0.03368027164861012,
		Memory: 0.060389042
	},
	{
		Pid: 622,
		Name: "secd",
		CPUUsage: 0.02796697434592964,
		Memory: 0.05736351
	},
	{
		Pid: 12346,
		Name: "com.apple.photos.ImageConversionService",
		CPUUsage: 0.00011339404527088397,
		Memory: 0.0543952
	},
	{
		Pid: 12955,
		Name: "mdworker_shared",
		CPUUsage: 0.0690382721664749,
		Memory: 0.021004677
	},
	{
		Pid: 11288,
		Name: "mediaanalysisd",
		CPUUsage: 0.04124537828201538,
		Memory: 0.051164627
	},
	{
		Pid: 750,
		Name: "com.apple.WebKit.Networking",
		CPUUsage: 0.48237560657609446,
		Memory: 1.5739775
	},
	{
		Pid: 12953,
		Name: "mdworker_shared",
		CPUUsage: 0.06983751714954206,
		Memory: 0.020873547
	},
	{
		Pid: 65575,
		Name: "Code Helper (Plugin)",
		CPUUsage: 0.1616581788897483,
		Memory: 0.38769245
	},
	{
		Pid: 90436,
		Name: "kitty",
		CPUUsage: 0.08270314877092878,
		Memory: 0.16778708
	},
	{
		Pid: 677,
		Name: "sharingd",
		CPUUsage: 0.062074799401697064,
		Memory: 0.061252117
	},
	{
		Pid: 715,
		Name: "Spotlight",
		CPUUsage: 0.015536840709389649,
		Memory: 0.37322044
	},
	{
		Pid: 689,
		Name: "ContextService",
		CPUUsage: 0.0006059145223419181,
		Memory: 0.06458759
	},
	{
		Pid: 662,
		Name: "cloudd",
		CPUUsage: 0.03272612809385651,
		Memory: 0.20060539
	},
	{
		Pid: 2397,
		Name: "com.apple.Safari.SafeBrowsing.Service",
		CPUUsage: 0.06309379237395547,
		Memory: 0.04839897
	},
	{
		Pid: 731,
		Name: "suggestd",
		CPUUsage: 0.06634282267012362,
		Memory: 0.16907454
	},
	{
		Pid: 64799,
		Name: "Code Helper",
		CPUUsage: 0.37102404020303686,
		Memory: 0.06093979
	},
	{
		Pid: 65568,
		Name: "Code Helper (Plugin)",
		CPUUsage: 0.009965898445809349,
		Memory: 0.10236502
	},
	{
		Pid: 64513,
		Name: "Code Helper (Renderer)",
		CPUUsage: 0.7061152318150151,
		Memory: 0.47314167
	},
	{
		Pid: 11973,
		Name: "Postman Helper",
		CPUUsage: 0.22077124451344282,
		Memory: 0.040960312
	},
	{
		Pid: 89457,
		Name: "com.apple.appkit.xpc.openAndSavePanelService",
		CPUUsage: 0.00200055618805712,
		Memory: 0.071549416
	},
	{
		Pid: 90009,
		Name: "Messages",
		CPUUsage: 0.33304895165819587,
		Memory: 0.18832684
	},
	{
		Pid: 700,
		Name: "Numbers",
		CPUUsage: 0.024192587680176302,
		Memory: 0.33201933
	},
	{
		Pid: 654,
		Name: "NotificationCenter",
		CPUUsage: 0.010354113914327678,
		Memory: 0.080645084
	},
	{
		Pid: 66364,
		Name: "Code Helper (Plugin)",
		CPUUsage: 0.013378803111354429,
		Memory: 0.067555904
	},
	{
		Pid: 592,
		Name: "cfprefsd",
		CPUUsage: 0.06813002340847403,
		Memory: 0.008318424
	},
	{
		Pid: 11971,
		Name: "Postman Helper (GPU)",
		CPUUsage: 0.6375085055814014,
		Memory: 0.06438732
	},
	{
		Pid: 2331,
		Name: "com.apple.appkit.xpc.openAndSavePanelService",
		CPUUsage: 0.0009836797061427908,
		Memory: 0.07351637
	},
	{
		Pid: 2653,
		Name: "com.apple.WebKit.WebContent",
		CPUUsage: 0.012147469025997906,
		Memory: 0.27290583
	},
	{
		Pid: 87242,
		Name: "Code Helper (Plugin)",
		CPUUsage: 0.06717929757138173,
		Memory: 0.06543398
	},
	{
		Pid: 707,
		Name: "Finder",
		CPUUsage: 0.08907906567134108,
		Memory: 0.31819344
	},
	{
		Pid: 11974,
		Name: "Postman Helper (Renderer)",
		CPUUsage: 3.2225472340243604,
		Memory: 0.29186964
	},
	{
		Pid: 12640,
		Name: "mdworker_shared",
		CPUUsage: 0.08021915738456047,
		Memory: 0.023078918
	},
	{
		Pid: 13238,
		Name: "mdworker_shared",
		CPUUsage: 0.1274757181682949,
		Memory: 0.017726421
	},
	{
		Pid: 64511,
		Name: "Code Helper (Renderer)",
		CPUUsage: 0.14178562059038938,
		Memory: 0.35790205
	},
	{
		Pid: 78840,
		Name: "knowledgeconstructiond",
		CPUUsage: 0.012154184771022307,
		Memory: 0.057303905
	},
	{
		Pid: 64505,
		Name: "Electron",
		CPUUsage: 0.2587954264539377,
		Memory: 0.23957968
	},
	{
		Pid: 624,
		Name: "corespotlightd",
		CPUUsage: 0.11400664613983502,
		Memory: 0.21810532
	},
	{
		Pid: 762,
		Name: "IMDPersistenceAgent",
		CPUUsage: 0.060342006297474694,
		Memory: 0.054073334
	},
	{
		Pid: 616,
		Name: "routined",
		CPUUsage: 0.07788721007379298,
		Memory: 0.088620186
	},
	{
		Pid: 701,
		Name: "Dock",
		CPUUsage: 0.05294336443117211,
		Memory: 0.09365082
	},
	{
		Pid: 34045,
		Name: "com.apple.WebKit.WebContent",
		CPUUsage: 0.0021728703531075123,
		Memory: 0.2641797
	},
	{
		Pid: 63874,
		Name: "com.apple.WebKit.GPU",
		CPUUsage: 0.9037470636924345,
		Memory: 0.37127733
	},
	{
		Pid: 66305,
		Name: "Code Helper (Plugin)",
		CPUUsage: 0.016449826575133303,
		Memory: 0.06916523
	},
	{
		Pid: 809,
		Name: "WallpaperVideoExtension",
		CPUUsage: 0.4494456121409602,
		Memory: 0.23180246
	},
	{
		Pid: 94432,
		Name: "com.apple.WebKit.WebContent",
		CPUUsage: 0.018361281142413304,
		Memory: 0.3075242
	},
	{
		Pid: 597,
		Name: "UserEventAgent",
		CPUUsage: 0.06390484894975729,
		Memory: 0.019419193
	},
	{
		Pid: 13262,
		Name: "__debug_bin1567713972",
		CPUUsage: 5.84909183071719,
		Memory: 0.099999905
	},
	{
		Pid: 755,
		Name: "QuickLookSatellite",
		CPUUsage: 0.00031857612175759527,
		Memory: 0.090527534
	},
	{
		Pid: 64797,
		Name: "Code Helper (Plugin)",
		CPUUsage: 0.18683743439485362,
		Memory: 0.5613375
	},
	{
		Pid: 64795,
		Name: "Code Helper",
		CPUUsage: 0.10779596584598461,
		Memory: 0.15666485
	},
	{
		Pid: 12952,
		Name: "mdworker_shared",
		CPUUsage: 0.2903815637693103,
		Memory: 0.023257732
	},
	{
		Pid: 62234,
		Name: "Music",
		CPUUsage: 0.5847303833353698,
		Memory: 0.1807189
	},
	{
		Pid: 12956,
		Name: "mdworker_shared",
		CPUUsage: 0.05706926621295637,
		Memory: 0.017786026
	},
	{
		Pid: 13199,
		Name: "AXVisualSupportAgent",
		CPUUsage: 0.1259109159800539,
		Memory: 0.021255016
	},
	{
		Pid: 765,
		Name: "avconferenced",
		CPUUsage: 0.021774681477765546,
		Memory: 0.22696495
	},
	{
		Pid: 704,
		Name: "ControlCenter",
		CPUUsage: 0.06463225186647592,
		Memory: 0.10634661
	},
	{
		Pid: 754,
		Name: "contactsd",
		CPUUsage: 0.06881389238637313,
		Memory: 0.05556345
	},
	{
		Pid: 798,
		Name: "photolibraryd",
		CPUUsage: 0.1793992768445783,
		Memory: 0.059068203
	},
	{
		Pid: 66178,
		Name: "Code Helper (Plugin)",
		CPUUsage: 0.015098945256391622,
		Memory: 0.0713253
	},
	{
		Pid: 2652,
		Name: "com.apple.WebKit.WebContent",
		CPUUsage: 0.12006883912564834,
		Memory: 0.8234668
	},
	{
		Pid: 64803,
		Name: "Code Helper (Plugin)",
		CPUUsage: 0.1049488613876414,
		Memory: 0.7550001
	},
	{
		Pid: 88017,
		Name: "com.apple.amp.devicesui",
		CPUUsage: 1.365335155891159,
		Memory: 0.049448013
	},
	{
		Pid: 67047,
		Name: "GitHub Desktop Helper (Renderer)",
		CPUUsage: 0.05475201613000756,
		Memory: 0.18751621
	},
	{
		Pid: 760,
		Name: "StocksWidget",
		CPUUsage: 0.011066373478285976,
		Memory: 0.10300875
	},
	{
		Pid: 672,
		Name: "WeatherWidget",
		CPUUsage: 0.006586898026030975,
		Memory: 0.05480051
	},
	{
		Pid: 13204,
		Name: "dlv",
		CPUUsage: 1.1792274545323183,
		Memory: 0.172925
	}
];

export const memoryInfoMock = 29.128611087799072;
