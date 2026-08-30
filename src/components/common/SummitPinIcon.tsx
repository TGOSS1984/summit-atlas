import { useId } from 'react'
import styles from './SummitPinIcon.module.css'

interface SummitPinIconProps {
  className?: string
}

export function SummitPinIcon({ className }: SummitPinIconProps) {
  const uid = useId()
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1248 1248" className={className ?? styles.icon} aria-hidden="true">
      <defs>
        <linearGradient id={`sunGradient-${uid}`}
          x1="624" y1="270"
          x2="624" y2="625"
          gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF4836"/>
          <stop offset="0.55" stopColor="#F74632"/>
          <stop offset="1" stopColor="#E73A2A"/>
        </linearGradient>
        <linearGradient id={`ringGradient-${uid}`}
          x1="260" y1="290"
          x2="980" y2="975"
          gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF4937"/>
          <stop offset="1" stopColor="#F33D2D"/>
        </linearGradient>
        <linearGradient id={`mountainMain-${uid}`}
          x1="625" y1="350"
          x2="625" y2="760"
          gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#274B53"/>
          <stop offset="1" stopColor="#173941"/>
        </linearGradient>
        <linearGradient id={`mountainDark-${uid}`}
          x1="500" y1="400"
          x2="790" y2="720"
          gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#21454D"/>
          <stop offset="1" stopColor="#12343C"/>
        </linearGradient>
        <linearGradient id={`mountainLight-${uid}`}
          x1="470" y1="440"
          x2="760" y2="690"
          gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3F6269"/>
          <stop offset="1" stopColor="#294E57"/>
        </linearGradient>
        <linearGradient id={`mountainMid-${uid}`}
          x1="380" y1="500"
          x2="870" y2="710"
          gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#31565E"/>
          <stop offset="1" stopColor="#203F48"/>
        </linearGradient>
        <linearGradient id={`snowGradient-${uid}`}
          x1="450" y1="330"
          x2="800" y2="600"
          gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF9E9"/>
          <stop offset="1" stopColor="#E6E0CE"/>
        </linearGradient>
        <radialGradient id={`globeGradient-${uid}`}
          cx="0" cy="0" r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(610 665) rotate(90) scale(370 400)">
          <stop offset="0" stopColor="#224950"/>
          <stop offset="0.55" stopColor="#173D45"/>
          <stop offset="1" stopColor="#10323A"/>
        </radialGradient>
        <linearGradient id={`gridGradient-${uid}`}
          x1="310" y1="600"
          x2="930" y2="960"
          gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#76999D"/>
          <stop offset="1" stopColor="#587D82"/>
        </linearGradient>
        <linearGradient id={`flagGradient-${uid}`}
          x1="630" y1="153"
          x2="749" y2="220"
          gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF4936"/>
          <stop offset="1" stopColor="#EE3324"/>
        </linearGradient>
        <linearGradient id={`flagShade-${uid}`}
          x1="629" y1="184"
          x2="703" y2="221"
          gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#D93828"/>
          <stop offset="1" stopColor="#E83A2A"/>
        </linearGradient>
        <clipPath id={`globeClip-${uid}`}>
          <path
            d="
              M 254 626
              C 254 829 420 994 624 994
              C 828 994 994 829 994 626
              C 944 672 875 703 797 719
              C 743 730 684 735 624 735
              C 563 735 505 730 450 719
              C 373 703 304 672 254 626
              Z
            "
          />
        </clipPath>
        <filter id={`softShadow-${uid}`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="8"
            floodColor="#061C22"
            floodOpacity="0.35"
          />
        </filter>
      </defs>
      <g filter={`url(#softShadow-${uid})`}>
        <circle
          cx="624"
          cy="626"
          r="382"
          stroke={`url(#ringGradient-${uid})`}
          strokeWidth="22"
        />
        <circle
          cx="624"
          cy="626"
          r="358"
          stroke="#10323A"
          strokeWidth="17"
        />
        <path
          d="
            M 276 538
            A 357 357 0 0 1 972 538
            L 919 507
            L 850 452
            L 810 464
            L 739 375
            L 624 286
            L 514 374
            L 469 441
            L 430 423
            L 356 496
            Z
          "
          fill={`url(#sunGradient-${uid})`}
        />
        <path
          d="
            M254 626
            C254 829
             420 994
             624 994
            C828 994
             994 829
             994 626
            C937 671
             868 702
             793 719
            C739 731
             682 736
             624 736
            C564 736
             507 731
             452 719
            C376 703
             307 671
             254 626
            Z
          "
          fill={`url(#globeGradient-${uid})`}
        />
        <g
          clipPath={`url(#globeClip-${uid})`}
          stroke={`url(#gridGradient-${uid})`}
          strokeWidth="7"
          opacity="0.9"
        >
          <path d="M 252 700 C 360 614 888 614 996 700" />
          <path d="M 276 819 C 394 733 853 733 972 819" />
          <path d="M 351 924 C 463 859 786 859 897 924" />
          <path d="M624 515 C623 600 622 706 624 790 C626 893 640 956 624 995" />
          <path d="M518 535 C500 602 502 706 514 790 C528 888 560 962 597 994" />
          <path d="M730 535 C748 602 746 706 734 790 C720 888 688 962 651 994" />
          <path d="M415 570 C380 639 384 738 410 816 C442 907 493 963 548 987" />
          <path d="M833 570 C868 639 864 738 838 816 C806 907 755 963 700 987" />
          <path d="M334 612 C290 689 305 782 341 852 C375 918 421 957 469 975" />
          <path d="M914 612 C958 689 943 782 907 852 C873 918 827 957 779 975" />
        </g>
        <path
          d="M253 630 L319 541 L384 505 L430 426 L470 449 L517 395 L572 466 L521 587 L415 638 L318 674 Z"
          fill={`url(#mountainMid-${uid})`}
        />
        <path
          d="M730 458 L793 501 L849 455 L885 485 L934 525 L994 618 L994 678 L888 631 L810 598 L749 550 Z"
          fill={`url(#mountainMid-${uid})`}
        />
        <path
          d="
            M253 642
            L319 585
            L381 548
            L430 477
            L470 498
            L518 431
            L567 345
            L624 286
            L682 371
            L724 432
            L777 485
            L810 505
            L848 477
            L883 511
            L936 553
            L994 623
            L994 675
            L903 623
            L830 598
            L760 566
            L701 534
            L624 488
            L554 543
            L488 571
            L407 603
            L328 654
            Z
          "
          fill={`url(#mountainMain-${uid})`}
        />
        <path
          d="
            M253 642
            L319 585
            L381 548
            L430 477
            L470 498
            L518 431
            L566 345
            L624 286
            L607 421
            L567 486
            L514 530
            L478 574
            L408 603
            L328 654
            Z
          "
          fill="#244851"
        />
        <path
          d="M624 286 L607 421 L568 487 L518 545 L549 520 L535 552 L579 516 L568 548 L624 488 Z"
          fill="#183A43"
        />
        <path
          d="M624 397 L701 534 L671 518 L710 561 L653 526 L674 569 L624 488 L585 535 L600 499 L566 545 Z"
          fill={`url(#mountainLight-${uid})`}
        />
        <path
          d="
            M624 286
            L682 371
            L724 432
            L777 485
            L810 505
            L848 477
            L883 511
            L936 553
            L994 623
            L994 675
            L903 623
            L830 598
            L760 566
            L701 534
            L624 488
            L646 415
            Z
          "
          fill={`url(#mountainDark-${uid})`}
          opacity="0.9"
        />
        <path
          d="M254 644 L348 582 L421 551 L391 598 L430 576 L400 635 L328 674 Z"
          fill="#345960"
        />
        <path
          d="M707 535 L758 568 L842 600 L906 630 L994 676 L930 620 L854 578 L811 552 L846 590 L776 550 Z"
          fill="#365A61"
        />
        <path
          d="
            M277 576
            L319 541
            L383 507
            L430 441
            L470 465
            L518 411
            L567 332
            L598 306
            L584 339
            L564 365
            L554 401
            L530 438
            L530 411
            L494 468
            L507 448
            L476 478
            L457 509
            L430 495
            L392 545
            L383 521
            L335 555
            Z
          "
          fill={`url(#snowGradient-${uid})`}
        />
        <path
          d="M567 332 L624 286 L645 323 L637 360 L659 424 L633 396 L629 439 L604 397 L613 358 L598 306 Z"
          fill="#F7F1DF"
        />
        <path
          d="
            M645 323
            L682 374
            L724 434
            L777 486
            L809 505
            L849 477
            L883 510
            L936 554
            L974 604
            L934 566
            L883 529
            L849 497
            L819 512
            L789 487
            L808 524
            L760 476
            L721 442
            L742 480
            L700 440
            L674 392
            L667 434
            L640 371
            Z
          "
          fill={`url(#snowGradient-${uid})`}
        />
        <path
          d="M620 151 L632 151 L632 292 L624 302 L620 292 Z"
          fill="#D8D1BD"
          opacity="0.55"
        />
        <rect
          x="619"
          y="148"
          width="10"
          height="148"
          rx="5"
          fill="#F6F0DE"
        />
        <circle cx="624" cy="149" r="8" fill="#F8F1DF" />
        <path d="M629 154 L749 190 L629 225 Z" fill={`url(#flagGradient-${uid})`} />
        <path d="M629 185 L749 190 L629 225 Z" fill={`url(#flagShade-${uid})`} />
        <path d="M629 154 L749 190 L661 187 Z" fill="#FF513C" opacity="0.88" />
      </g>
    </svg>
  )
}