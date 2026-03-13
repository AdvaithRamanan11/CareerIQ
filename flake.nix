{
  description = "CareerIQ — Texas Income & Loan ROI";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin" ];

      perSystem = { pkgs, ... }: {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            nodePackages.npm
          ];
          shellHook = ''
            echo "CareerIQ dev shell — node $(node --version), npm $(npm --version)"
          '';
        };

        packages.default = pkgs.buildNpmPackage {
          pname = "careeriq";
          version = "0.1.0";
          src = ./.;
          npmDepsHash = pkgs.lib.fakeHash;
          installPhase = ''
            cp -r dist $out
          '';
        };
      };
    };
}
