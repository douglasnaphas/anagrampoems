terraform {
  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "anagrampoems"

    workspaces {
      name = "anagrampoems-prod"
    }
  }
}
