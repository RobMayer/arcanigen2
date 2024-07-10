import styled from "styled-components";
import Link from "../../components/buttons/Link";

export const GridGammaAbout = () => {
    return (
        <Wrapper>
            <h2>A bit of history</h2>
            <p>
                When you get down to it, this is intended to be an easy way to create Gridfinity-like boxes that are designed from the ground-up to be manufactured on a laser rather than a 3d printer.
                As much as I enjoy the idea of Gridfinity, I have never really liked FDM printers (too fiddly for me), and the time that it took me to print even a handful of Gridfinity containers
                drove me buggo. Having a laser, where I was able to cut a box in about 10 seconds, seemed like the logical alternative.
            </p>
            <p>
                I proceeded to start designing a <em>system</em>. Turns out that the cumulative time to do that was probably more than it would've taken me to print dozens of Gridfinity boxes, but
                what's a little lost-cost fallacy between friends. And with one cliche out of the way I opted for another: in for a penny in for a pound. Why not make the entire system parametric? Of
                course that would mean learning Fusion 360, and massaging that until it output the system I wanted... Or I could write a React app to do that instead.
            </p>
            <p>
                So here we are: Gridfinity-Gamma (Gamma, being the symbol used to represent the wavelength of radiation... becuase light, and lasers and stuff). It's not actually compatible with
                Gridfinity, but being purpose built for a laser, I didn't think that was really that necessary - plus, I like the 48mm size over 42, anyways.
            </p>
            <h2>Credits</h2>
            <p>
                Shout out to{" "}
                <Link url="https://www.youtube.com/@ZackFreedman" target="_blank">
                    Zach Freedman
                </Link>{" "}
                for creating Gridfinity in the first place, and for being (hopefully) cool with me forking it in this way.
            </p>
            <p>
                Credit to{" "}
                <Link url="https://github.com/tyschroed" target="_blank">
                    Tyler Schroeder
                </Link>{" "}
                for his work on the Guillotine-Packer which I have shamelessly re-written to do what I wanted it to. Turns out Bin-Packing is really non-trivial, and this would've fallen apart if I
                didn't have his work as a starting point.
            </p>
            <p>
                Relatedly, a shout-out to{" "}
                <Link url="https://jakesgordon.com/" target="_blank">
                    Jake Gordon
                </Link>{" "}
                for his great article on Bin-Packing.
            </p>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    padding: 1em;
    max-width: 720px;
    & > h2 {
        font-size: 1.5em;
        border-bottom: 1px solid #fff3;
    }
    & > p {
        text-indent: 1em;
        line-height: 1.6em;
        margin-block: 0.5em;
    }
`;
